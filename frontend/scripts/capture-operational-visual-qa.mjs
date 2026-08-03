import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import process from 'node:process';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4200';
const chromeExecutable = process.env.CHROME_EXECUTABLE;
const outputDirectory = process.env.OUTPUT_DIRECTORY ?? 'visual-qa';
const debuggingPort = Number(process.env.CHROME_DEBUGGING_PORT ?? 9222);

if (!chromeExecutable) {
  throw new Error('CHROME_EXECUTABLE is required.');
}

await mkdir(outputDirectory, { recursive: true });

const reset = await jsonFetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
const claimId = reset.claimId;
if (!claimId) throw new Error('Demo reset did not return claimId.');

const chrome = spawn(chromeExecutable, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=/tmp/claimsflow-visual-qa-${process.pid}`,
  '--window-size=1440,1180',
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let chromeError = '';
chrome.stderr.on('data', chunk => { chromeError += chunk.toString(); });

try {
  const target = await waitForPageTarget(debuggingPort);
  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Runtime.enable');

  await setViewport(cdp, 1440, 1180, false);

  await capture(cdp, 'tour-1440x1180.png', `${baseUrl}/tour`);
  await capture(cdp, 'claimant-portal-1440x1180.png', `${baseUrl}/portal/claims/${claimId}`);
  await capture(cdp, 'adjuster-claim-1440x1180.png', `${baseUrl}/app/claims/${claimId}?role=adjuster`);
  await capture(cdp, 'manager-dashboard-baseline-1440x1180.png', `${baseUrl}/app/dashboard?role=manager&claimId=${claimId}`);
  await capture(cdp, 'manager-queue-sla-filtered-1440x1180.png', `${baseUrl}/app/claims?role=manager&claimId=${claimId}&sort=slaDeadline%2Casc`);
  await capture(cdp, 'analytics-default-1440x1180.png', `${baseUrl}/app/analytics?role=manager`);
  await capture(cdp, 'analytics-west-filtered-1440x1180.png', `${baseUrl}/app/analytics?role=manager&region=WEST`);
  await capture(cdp, 'team-operations-default-1440x1180.png', `${baseUrl}/app/team-ops?role=manager`);
  await capture(cdp, 'team-operations-filtered-1440x1180.png', `${baseUrl}/app/team-ops?role=manager&team=SIU%20Investigations`);
  await capture(cdp, 'evidence-operations-1440x1180.png', `${baseUrl}/app/documents?role=adjuster&selectedClaimId=${claimId}`);
  await capture(cdp, 'administrator-workflows-1440x1180.png', `${baseUrl}/app/workflows?role=admin&claimId=${claimId}`);

  await jsonFetch(`${baseUrl}/api/portal/claims/${claimId}/evidence`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'PHOTOS', present: true, actor: 'Visual QA' }),
  });
  await capture(cdp, 'manager-dashboard-after-evidence-1440x1180.png', `${baseUrl}/app/dashboard?role=manager&claimId=${claimId}`);
  await capture(cdp, 'evidence-operations-after-update-1440x1180.png', `${baseUrl}/app/documents?role=adjuster&selectedClaimId=${claimId}`);

  await navigate(cdp, `${baseUrl}/app/dashboard?role=manager&claimId=${claimId}`);
  await cdp.send('Network.setBlockedURLs', { urls: ['*://127.0.0.1:4200/api/dashboard*', '*://localhost:4200/api/dashboard*'] });
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const button = [...document.querySelectorAll('button')].find(element => element.textContent?.trim() === 'Refresh');
      if (!button) throw new Error('Refresh button not found');
      button.click();
    })()`,
    awaitPromise: true,
  });
  await delay(1_500);
  await screenshot(cdp, 'manager-dashboard-stale-1440x1180.png');
  await cdp.send('Network.setBlockedURLs', { urls: [] });

  await cdp.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await capture(cdp, 'manager-dashboard-reduced-motion-1440x1180.png', `${baseUrl}/app/dashboard?role=manager&claimId=${claimId}`);
  await cdp.send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });

  await setViewport(cdp, 390, 844, true);
  await capture(cdp, 'claimant-portal-mobile-390x844.png', `${baseUrl}/portal/claims/${claimId}`);
  await capture(cdp, 'manager-dashboard-mobile-390x844.png', `${baseUrl}/app/dashboard?role=manager&claimId=${claimId}`);
  await capture(cdp, 'evidence-operations-mobile-390x844.png', `${baseUrl}/app/documents?role=adjuster&selectedClaimId=${claimId}`);

  cdp.close();
  console.log(`Captured operational visual QA for claim ${claimId}.`);
} finally {
  chrome.kill('SIGTERM');
  await delay(300);
  if (chrome.exitCode && chrome.exitCode !== 0) {
    throw new Error(`Chrome exited with ${chrome.exitCode}: ${chromeError.slice(-2000)}`);
  }
}

async function capture(cdp, filename, url) {
  await navigate(cdp, url);
  await screenshot(cdp, filename);
}

async function navigate(cdp, url) {
  const result = await cdp.send('Page.navigate', { url });
  if (result.errorText) throw new Error(`Navigation failed for ${url}: ${result.errorText}`);

  const expected = new URL(url);
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const state = await cdp.send('Runtime.evaluate', {
        expression: `({ href: location.href, readyState: document.readyState })`,
        returnByValue: true,
      });
      const value = state.result?.value;
      if (value?.readyState !== 'loading') {
        const current = new URL(value.href);
        if (current.origin === expected.origin && current.pathname === expected.pathname) {
          await waitForStablePage(cdp);
          return;
        }
      }
    } catch {
      // The JavaScript execution context is briefly replaced during navigation.
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for navigation to ${url}.`);
}

async function waitForStablePage(cdp) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const result = await cdp.send('Runtime.evaluate', {
        expression: `({
          ready: document.readyState === 'complete',
          busy: document.querySelectorAll('[aria-busy="true"]').length,
          loading: [...document.querySelectorAll('[role="status"]')].some(node => /loading/i.test(node.textContent || ''))
        })`,
        returnByValue: true,
      });
      const value = result.result?.value;
      if (value?.ready && !value.busy && !value.loading) {
        await delay(650);
        return;
      }
    } catch {
      // Continue while Angular replaces or stabilizes the document context.
    }
    await delay(200);
  }
  await delay(1_000);
}

async function screenshot(cdp, filename) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  if (!result.data) throw new Error(`No screenshot bytes returned for ${filename}.`);
  await writeFile(`${outputDirectory}/${filename}`, Buffer.from(result.data, 'base64'));
  console.log(`Captured ${filename}`);
}

async function setViewport(cdp, width, height, mobile) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`${options.method ?? 'GET'} ${url} failed ${response.status}: ${text}`);
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

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', event => this.onMessage(event));
    this.socket.addEventListener('close', () => {
      for (const { reject } of this.pending.values()) reject(new Error('Chrome DevTools connection closed.'));
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method, timeoutMilliseconds) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(method, listener);
        reject(new Error(`Timed out waiting for ${method}.`));
      }, timeoutMilliseconds);
      const listener = params => {
        clearTimeout(timeout);
        this.removeListener(method, listener);
        resolve(params);
      };
      const listeners = this.listeners.get(method) ?? [];
      listeners.push(listener);
      this.listeners.set(method, listeners);
    });
  }

  close() {
    this.socket.close();
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
      return;
    }
    const listeners = this.listeners.get(message.method) ?? [];
    for (const listener of [...listeners]) listener(message.params ?? {});
  }

  removeListener(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    this.listeners.set(method, listeners.filter(candidate => candidate !== listener));
  }
}
