const UserAgent =  require('user-agents');
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth")();
["chrome.runtime", "navigator.languages","iframe.contentWindow","navigator.plugins"].forEach(a =>
  stealthPlugin.enabledEvasions.delete(a)
);

puppeteer.use(stealthPlugin);
const chrome_user_data_directory = "./profile/";
const window_height = 768;
const window_width = 1366;
const studio_url = "https://studio.youtube.com/";
const userAgent = new UserAgent({ platform: 'Win32' }).toString();

const DEFAULT_ARGS = [
  '--disable-background-networking',
  '--enable-features=NetworkService,NetworkServiceInProcess',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-extensions-with-background-pages',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  // BlinkGenPropertyTrees disabled due to crbug.com/937609
  '--disable-features=TranslateUI,BlinkGenPropertyTrees',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-sync',
  '--force-color-profile=srgb',
  '--metrics-recording-only',
  '--no-first-run',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
];


main();
async function main() {
const browser = await puppeteer.launch(
            {
                'headless': false,    // have window
                executablePath: null,
                userDataDir: chrome_user_data_directory,
                ignoreDefaultArgs: DEFAULT_ARGS,
                autoClose: false,
                args: ['--lang=en-US,en',
                    `--window-size=${window_width},${window_height}`,
                    '--enable-audio-service-sandbox',
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]})

      let page = await browser.newPage();
        await page.setViewport({'width': window_width, 'height': window_height});
        page.setUserAgent(userAgent);
        await page.goto(studio_url, options = {'timeout': 20 * 1000});}
