import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { CdpClient } from './visual-qa/cdp-client.mjs';
import {
  BrowserDiagnostics,
  assertCurrentPage,
  assertExpectedVisualDifferences,
  captureScreenshot,
  configureScenario,
  delay,
  detectGraphicsMode,
  navigateAndAssert,
  waitForText,
} from './visual-qa/assertions.mjs';
import { createVisualQaScenarios } from './visual-qa/scenarios.mjs';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4200';
const chromeExecutable = process.env.CHROME_EXECUTABLE;
const outputDirectory = process.env.OUTPUT_DIRECTORY ?? 'visual-qa';
const debuggingPort = Number(process.env.CHROME_DEBUGGING_PORT ?? 9222);

if (!chromeExecutable) throw new Error('CHROME_EXECUTABLE is required.');

await mkdir(outputDirectory, { recursive: true });
const reset = await jsonFetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
const claimId = reset.claimId;
if (!claimId) throw new Error('Demo reset did not return claimId.');

const chrome = spawn(chromeExecutable, [
  '--headless=new',
  '--no-sandbox',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=/tmp/claimsflow-visual-qa-${process.pid}`,
  '--window-size=1440,1180',
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let chromeError = '';
let cdp = null;
let diagnostics = null;
let graphicsMode = 'not-observed';
const screenshots = [];
chrome.stderr.on('data', chunk => { chromeError += chunk.toString(); });

try {
  const target = await waitForPageTarget(debuggingPort);
  cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.ready;
  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Network.enable'),
    cdp.send('Runtime.enable'),
    cdp.send('Log.enable'),
  ]);
  diagnostics = new BrowserDiagnostics(cdp);

  const scenarios = createVisualQaScenarios(baseUrl, claimId);
  for (const scenario of scenarios.beforeMutation) {
    await runScenario(cdp, scenario, screenshots);
    if (scenario.name === 'manager-dashboard-baseline') {
      graphicsMode = await detectGraphicsMode(cdp);
    }
  }

  await jsonFetch(`${baseUrl}/api/portal/claims/${claimId}/evidence`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'PHOTOS', present: true, actor: 'Visual QA' }),
  });
  for (const scenario of scenarios.afterMutation) {
    await runScenario(cdp, scenario, screenshots);
  }

  await runStaleScenario(cdp, diagnostics, scenarios.stale, screenshots);
  await runScenario(cdp, scenarios.reducedMotion, screenshots);
  for (const scenario of scenarios.mobile) {
    await runScenario(cdp, scenario, screenshots);
  }

  if (screenshots.length !== 18) {
    throw new Error(`Expected 18 screenshots, captured ${screenshots.length}.`);
  }
  if (!diagnostics.allowedRequestFailures.some(failure => failure.url.includes('/api/dashboard'))) {
    throw new Error('The stale-data scenario did not observe the intentionally blocked dashboard request.');
  }

  diagnostics.assertClean();
  assertExpectedVisualDifferences(screenshots);

  const manifest = {
    generatedAt: new Date().toISOString(),
    claimId,
    graphicsMode,
    screenshotCount: screenshots.length,
    screenshots,
    consoleErrors: diagnostics.consoleErrors,
    browserExceptions: diagnostics.exceptions,
    unexpectedRequestFailures: diagnostics.unexpectedRequestFailures,
    allowedRequestFailures: diagnostics.allowedRequestFailures,
  };
  await writeFile(
    `${outputDirectory}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`Captured and validated ${screenshots.length} operational states for claim ${claimId}.`);
  console.log(`Graphics mode: ${graphicsMode}.`);
} catch (error) {
  const failureManifest = {
    generatedAt: new Date().toISOString(),
    claimId,
    graphicsMode,
    error: error instanceof Error ? error.stack ?? error.message : String(error),
    screenshots,
    consoleErrors: diagnostics?.consoleErrors ?? [],
    browserExceptions: diagnostics?.exceptions ?? [],
    unexpectedRequestFailures: diagnostics?.unexpectedRequestFailures ?? [],
    allowedRequestFailures: diagnostics?.allowedRequestFailures ?? [],
    chromeError: chromeError.slice(-4_000),
  };
  await writeFile(
    `${outputDirectory}/manifest.failure.json`,
    `${JSON.stringify(failureManifest, null, 2)}\n`,
    'utf8',
  );
  throw error;
} finally {
  diagnostics?.release();
  cdp?.close();
  chrome.kill('SIGTERM');
  await delay(300);
}

async function runScenario(client, scenario, records) {
  await configureScenario(client, scenario);
  await navigateAndAssert(client, scenario);
  const record = await captureScreenshot(client, `${outputDirectory}/${scenario.filename}`, scenario);
  records.push(record);
  console.log(`Captured ${scenario.filename}`);
}

async function runStaleScenario(client, browserDiagnostics, scenario, records) {
  await configureScenario(client, scenario);
  const warmScenario = {
    ...scenario,
    name: `${scenario.name}-warmup`,
    requiredText: ['Operations Overview', 'Updated'],
  };
  await navigateAndAssert(client, warmScenario);

  const releaseAllowedFailure = browserDiagnostics.allowApiFailure(failure => {
    try {
      return new URL(failure.url).pathname === '/api/dashboard';
    } catch {
      return false;
    }
  });
  await client.send('Network.setBlockedURLs', {
    urls: [
      '*://127.0.0.1:4200/api/dashboard*',
      '*://localhost:4200/api/dashboard*',
    ],
  });

  try {
    const clicked = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const button = [...document.querySelectorAll('button')]
          .find(element => element.textContent?.trim() === 'Refresh');
        if (!button) return false;
        button.click();
        return true;
      })()`,
      returnByValue: true,
    });
    if (clicked.result?.value !== true) throw new Error('Refresh button not found for stale-data scenario.');
    await waitForText(client, 'Showing the last successful update.', 10_000);
    await assertCurrentPage(client, scenario);
    const record = await captureScreenshot(client, `${outputDirectory}/${scenario.filename}`, scenario);
    records.push(record);
    console.log(`Captured ${scenario.filename}`);
  } finally {
    await client.send('Network.setBlockedURLs', { urls: [] });
    releaseAllowedFailure();
  }
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} failed ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function waitForPageTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/list`;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const targets = await response.json();
        const target = targets.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target;
      }
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error(`Chrome DevTools target did not become available at ${endpoint}.`);
}
