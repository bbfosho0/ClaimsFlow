import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

export class BrowserDiagnostics {
  constructor(cdp) {
    this.requests = new Map();
    this.consoleErrors = [];
    this.exceptions = [];
    this.unexpectedRequestFailures = [];
    this.allowedRequestFailures = [];
    this.allowedFailurePredicates = new Set();
    this.releases = [
      cdp.on('Network.requestWillBeSent', event => {
        this.requests.set(event.requestId, event.request?.url ?? '');
      }),
      cdp.on('Network.loadingFinished', event => {
        this.requests.delete(event.requestId);
      }),
      cdp.on('Network.loadingFailed', event => this.onLoadingFailed(event)),
      cdp.on('Runtime.exceptionThrown', event => {
        const details = event.exceptionDetails ?? {};
        const message = details.exception?.description ?? details.text ?? 'Uncaught browser exception';
        this.exceptions.push(message);
      }),
      cdp.on('Runtime.consoleAPICalled', event => {
        if (event.type !== 'error') return;
        const message = (event.args ?? [])
          .map(argument => argument.value ?? argument.description ?? argument.type)
          .join(' ');
        this.consoleErrors.push(message || 'console.error called');
      }),
      cdp.on('Log.entryAdded', event => {
        if (event.entry?.level === 'error') this.consoleErrors.push(event.entry.text);
      }),
    ];
  }

  allowApiFailure(predicate) {
    this.allowedFailurePredicates.add(predicate);
    return () => this.allowedFailurePredicates.delete(predicate);
  }

  assertClean() {
    const messages = [];
    if (this.exceptions.length) messages.push(`Browser exceptions:\n${this.exceptions.join('\n')}`);
    if (this.consoleErrors.length) messages.push(`Console errors:\n${this.consoleErrors.join('\n')}`);
    if (this.unexpectedRequestFailures.length) {
      messages.push(`Unexpected API request failures:\n${this.unexpectedRequestFailures
        .map(failure => `${failure.url} — ${failure.errorText}`)
        .join('\n')}`);
    }
    if (messages.length) throw new Error(messages.join('\n\n'));
  }

  release() {
    for (const release of this.releases) release();
    this.releases = [];
  }

  onLoadingFailed(event) {
    const url = this.requests.get(event.requestId) ?? '';
    this.requests.delete(event.requestId);
    if (!url.includes('/api/')) return;
    if (event.canceled || event.errorText === 'net::ERR_ABORTED') return;
    const failure = { url, errorText: event.errorText ?? 'unknown network failure' };
    if ([...this.allowedFailurePredicates].some(predicate => predicate(failure))) {
      this.allowedRequestFailures.push(failure);
    } else {
      this.unexpectedRequestFailures.push(failure);
    }
  }
}

export async function configureScenario(cdp, scenario) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: scenario.viewport.width,
    height: scenario.viewport.height,
    deviceScaleFactor: 1,
    mobile: scenario.viewport.mobile,
    screenWidth: scenario.viewport.width,
    screenHeight: scenario.viewport.height,
  });
  await cdp.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: scenario.reducedMotion
      ? [{ name: 'prefers-reduced-motion', value: 'reduce' }]
      : [],
  });
}

export async function navigateAndAssert(cdp, scenario, timeoutMilliseconds = 24_000) {
  const navigation = await cdp.send('Page.navigate', { url: scenario.url });
  if (navigation.errorText) {
    throw new Error(`${scenario.name}: navigation failed: ${navigation.errorText}`);
  }

  const deadline = Date.now() + timeoutMilliseconds;
  let lastState = null;
  while (Date.now() < deadline) {
    try {
      const evaluation = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const visible = node => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          };
          const bodyText = document.body?.innerText ?? '';
          const alerts = [...document.querySelectorAll('[role="alert"]')]
            .filter(visible)
            .map(node => node.textContent?.trim() ?? '')
            .filter(Boolean);
          const loading = [...document.querySelectorAll('[role="status"]')]
            .filter(visible)
            .some(node => /loading/i.test(node.textContent ?? ''));
          return {
            href: location.href,
            readyState: document.readyState,
            bodyText,
            alerts,
            busy: document.querySelectorAll('[aria-busy="true"]').length,
            loading,
            headingCount: document.querySelectorAll('h1').length,
          };
        })()`,
        returnByValue: true,
      });
      lastState = evaluation.result?.value ?? null;
      if (lastState && pageMatchesScenario(lastState, scenario)) {
        await delay(650);
        return lastState;
      }
    } catch {
      // Angular may replace the JavaScript execution context during navigation.
    }
    await delay(200);
  }

  throw new Error(`${scenario.name}: page did not reach the expected state. Last state: ${JSON.stringify(lastState)}`);
}

export async function waitForText(cdp, expectedText, timeoutMilliseconds = 8_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    const evaluation = await cdp.send('Runtime.evaluate', {
      expression: `document.body?.innerText ?? ''`,
      returnByValue: true,
    });
    if (String(evaluation.result?.value ?? '').includes(expectedText)) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for visible text: ${expectedText}`);
}

export async function captureScreenshot(cdp, outputPath, scenario) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  if (!result.data) throw new Error(`${scenario.name}: Chrome returned no screenshot bytes.`);

  const bytes = Buffer.from(result.data, 'base64');
  const dimensions = pngDimensions(bytes);
  if (dimensions.width !== scenario.viewport.width || dimensions.height !== scenario.viewport.height) {
    throw new Error(
      `${scenario.name}: expected ${scenario.viewport.width}x${scenario.viewport.height}, received ${dimensions.width}x${dimensions.height}.`,
    );
  }
  const minimumBytes = scenario.viewport.mobile ? 5_000 : 10_000;
  if (bytes.length < minimumBytes) {
    throw new Error(`${scenario.name}: screenshot is suspiciously small at ${bytes.length} bytes.`);
  }

  await writeFile(outputPath, bytes);
  return {
    name: scenario.name,
    filename: scenario.filename,
    width: dimensions.width,
    height: dimensions.height,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

export async function detectGraphicsMode(cdp) {
  const evaluation = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return 'static-fallback';
      try {
        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
        return context ? 'software-webgl' : 'canvas-fallback';
      } catch {
        return 'canvas-fallback';
      }
    })()`,
    returnByValue: true,
  });
  return evaluation.result?.value ?? 'unknown';
}

export function assertExpectedVisualDifferences(records) {
  const byName = new Map(records.map(record => [record.name, record]));
  const distinctPairs = [
    ['analytics-default', 'analytics-west-filtered'],
    ['team-operations-default', 'team-operations-filtered'],
    ['evidence-operations', 'evidence-operations-after-update'],
    ['claimant-portal', 'manager-dashboard-baseline'],
  ];
  for (const [leftName, rightName] of distinctPairs) {
    const left = byName.get(leftName);
    const right = byName.get(rightName);
    if (!left || !right) throw new Error(`Missing screenshots for distinctness assertion: ${leftName}, ${rightName}`);
    if (left.sha256 === right.sha256) {
      throw new Error(`Expected ${leftName} and ${rightName} to render differently.`);
    }
  }
}

export function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function pageMatchesScenario(state, scenario) {
  if (state.readyState === 'loading' || state.busy || state.loading) return false;
  const current = new URL(state.href);
  if (current.pathname !== scenario.expectedPath) return false;
  for (const [key, value] of Object.entries(scenario.expectedQuery)) {
    if (current.searchParams.get(key) !== value) return false;
  }
  if (!scenario.requiredText.every(text => state.bodyText.includes(text))) return false;
  if (scenario.forbiddenText.some(text => state.bodyText.includes(text))) return false;
  if (state.alerts.length) return false;
  if (!state.bodyText.trim() || state.headingCount < 1) return false;
  return true;
}

function pngDimensions(bytes) {
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a' || bytes.length < 24) {
    throw new Error('Screenshot is not a valid PNG.');
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}
