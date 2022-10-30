const fs = require("fs");
// load puppeteer
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth")();
["chrome.runtime", "navigator.languages","iframe.contentWindow","navigator.plugins"].forEach(a =>
  stealthPlugin.enabledEvasions.delete(a)
);

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26';
const window_height =  768 //700 + Math.floor(Math.random() * 100) ;
const window_width = 1366 // + Math.floor(Math.random() * 100) ;
const studio_url = "https://studio.youtube.com/";

// directory contains the videos you want to upload
const upload_file_directory = "./uploads/";
// change user data directory to your directory
const chrome_user_data_directory = "./profile";

const title_prefix = "video title here "; //title must edit
const video_description = "video description here"; // description must edit

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

let files = [];
fs.readdir(upload_file_directory, function (err, temp_files) {
    if (err) {
        console.log('Something went wrong...');
        return console.error(err);
    }
    for (let i = 0; i < temp_files.length; i++) {
        files.push(temp_files[i]);
    }
});

try {
    (async () => {
        const browser = await puppeteer.launch(
            {
                'headless': true,    // have window
                executablePath: require("puppeteer").executablePath(),
                userDataDir: chrome_user_data_directory,
                ignoreDefaultArgs: DEFAULT_ARGS,
                autoClose: false,
                args: ['--lang=en-US,en',
                    `--window-size=${window_width},${window_height}`,
                    '--enable-audio-service-sandbox',
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
            }
        );
        let page = await browser.newPage();
        await page.setViewport({'width': window_width, 'height': window_height});
        page.setUserAgent(userAgent)
        //bloack images & stylesheet etc
        await page.setRequestInterception(true);

        page.on('request', (request) => {
          if(['image', 'stylesheet', 'font'].includes(request.resourceType())) {
            request.abort();
          } else {
            request.continue();
          }
        })

        await page.goto(studio_url, options = {'timeout': 20 * 1000});
        
        function getRandomNumber() {
            var random = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
             return random;
           };
           await page.waitForTimeout(getRandomNumber());
        for (let i = 0; i < files.length; i++) {
            const file_name = files[i];
            console.log("now process file:\t" + file_name);

            //click create icon
            await page.waitForXPath('//*[@id="create-icon"]/div')
            await page.click('#create-icon');
            //click upload video
            await page.click('#text-item-0 > ytcp-ve');
            await page.waitForTimeout(getRandomNumber());
            await sleep(500);
            //click select files button and upload file
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                page.click('#select-files-button > div'), // some button that triggers file selection
            ]);
            await fileChooser.accept([upload_file_directory + file_name]);
            await page.waitForTimeout(getRandomNumber());
            // wait 10 seconds
            await sleep(10_000);
            
            await page.waitForXPath('//*[@id="img-with-fallback"]');
            // title content
            const text_box = await page.$x("//*[@id=\"textbox\"]");
            await text_box[0].type(title_prefix + file_name.replace('.mp4', ''));
            //  await page.type('#textbox', title_prefix + file_name.replace('.mp4',''));
            await sleep(1000);

            // Description content
            await text_box[1].type(video_description);

            await sleep(1000);
            
            // add video to the second playlists

            // await page.click('#basics > ytcp-video-metadata-playlists > ytcp-text-dropdown-trigger > ytcp-dropdown-trigger > div');
            // await page.click('#items > ytcp-ve:nth-child(3)');
            // await page.click('#dialog > div.action-buttons.style-scope.ytcp-playlist-dialog > ytcp-button.save-button.action-button.style-scope.ytcp-playlist-dialog > div');
            // await sleep(500);
            await page.waitForXPath('//*[@id="audience"]/ytkc-made-for-kids-select/div[4]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[2]');
            const age = await page.$x('//*[@id="audience"]/ytkc-made-for-kids-select/div[4]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[2]');
            await age[0].click();
            await page.waitForTimeout(getRandomNumber() * 2);
            //click next
            await page.click('#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > div.right-button-area.style-scope.ytcp-uploads-dialog');
            await sleep(1000);
            await page.waitForTimeout(getRandomNumber());
            //click next
            await page.click('#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > div.right-button-area.style-scope.ytcp-uploads-dialog');
            await sleep(1000);
            
            await page.waitForTimeout(getRandomNumber() );
            //click publish now and public
            // await page.click('#radioLabel > ytcp-ve'); //cannot click both is same
            await page.click('#next-button > div');
            await page.waitForTimeout(getRandomNumber() * 2);
            await page.waitForXPath('/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-uploads-review/div[2]/div[1]/ytcp-video-visibility-select/div[2]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[3]/div[2]')
            const public = await page.$x('/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-uploads-review/div[2]/div[1]/ytcp-video-visibility-select/div[2]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[3]/div[2]')
            await public[0].click();
            //await page.click('#privacy-radios > tp-yt-paper-radio-button:nth-child(19)');
            await page.waitForTimeout(getRandomNumber());
            await page.click('#done-button > div');
            await sleep(5000);
            // close
            await page.click('#close-button > div');

            // wait 60 seconds
            await sleep(60 * 1000);
        }
        await browser.close();
    })();

} catch (error) {
    console.log(error);
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
