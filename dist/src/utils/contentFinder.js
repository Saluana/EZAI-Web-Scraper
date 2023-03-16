"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentFinderMultiple = exports.contentFinder = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const browserInstance = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.BROWSERLESS_API_KEY) {
        console.log('Browserless is enabled');
        return yield puppeteer_1.default.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        });
    }
    try {
        return puppeteer_1.default.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-sandbox',
            ],
        });
    }
    catch (error) {
        console.log(error);
        return;
    }
});
function contentFinder(URI) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield browserInstance();
        const page = yield browser.newPage();
        // Prevent images, ads, analytics, and stylesheets from being loaded
        yield page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if ([
                'image',
                'stylesheet',
                'font',
                'media',
                'eventsource',
                'websocket',
            ].includes(resourceType)) {
                request.abort();
            }
            else {
                request.continue();
            }
        });
        try {
            yield page.goto(URI, {
                waitUntil: 'domcontentloaded',
            });
        }
        catch (error) {
            console.log(error);
            browser.close();
            return { status: 'failure', message: 'Error navigating to web page.' };
        }
        const title = yield page.title();
        try {
            var content = yield page.evaluate(() => {
                const body = document.querySelector('body');
                const array = new Set();
                let contentWasFound = false;
                // Get all paragraph tags from any div with the class name of article or post or content
                body.querySelectorAll('div').forEach((div) => {
                    for (let i = 0; i < div.classList.length; i++) {
                        if (div.classList[i].includes('article') ||
                            div.classList[i].includes('post') ||
                            div.classList[i].includes('content')) {
                            div.querySelectorAll('p').forEach((p) => {
                                const text = p.innerText;
                                if (text.split(' ').length > 20) {
                                    array.add(text);
                                }
                            });
                            contentWasFound = true;
                            break;
                        }
                    }
                });
                return Array.from(array);
            });
        }
        catch (error) {
            console.log(error);
            browser.close();
        }
        browser.close();
        console.log(content.join(' '));
        if (content === null)
            return {
                status: 'failure',
                message: 'No article found',
            };
        return { status: 'success', title: title, text: content };
    });
}
exports.contentFinder = contentFinder;
// Create a new async function that accepts an array of URIs
function contentFinderMultiple(URIs) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield browserInstance();
        const results = [];
        // A helper function that accepts a URI and returns the scraped content
        const scrapeContent = (URI) => __awaiter(this, void 0, void 0, function* () {
            const page = yield browser.newPage();
            // Prevent images, ads, analytics, and stylesheets from being loaded
            yield page.setRequestInterception(true);
            page.on('request', (request) => {
                const resourceType = request.resourceType();
                if ([
                    'image',
                    'stylesheet',
                    'font',
                    'media',
                    'eventsource',
                    'websocket',
                ].includes(resourceType)) {
                    request.abort();
                }
                else {
                    request.continue();
                }
            });
            const title = yield page.title();
            try {
                yield page.goto(URI, {
                    waitUntil: 'domcontentloaded',
                });
            }
            catch (error) {
                console.log(error);
                browser.close();
                return {
                    status: 'failure',
                    message: 'Error navigating to web page.',
                };
            }
            try {
                var content = yield page.evaluate(() => {
                    const body = document.querySelector('body');
                    const array = new Set();
                    let contentWasFound = false;
                    // Get all paragraph tags from any div with the class name of article or post or content
                    body.querySelectorAll('div').forEach((div) => {
                        for (let i = 0; i < div.classList.length; i++) {
                            if (div.classList[i].includes('article') ||
                                div.classList[i].includes('post') ||
                                div.classList[i].includes('content')) {
                                div.querySelectorAll('p').forEach((p) => {
                                    const text = p.innerText;
                                    if (text.split(' ').length > 20) {
                                        array.add(text);
                                    }
                                });
                                contentWasFound = true;
                                break;
                            }
                        }
                    });
                    return Array.from(array);
                });
            }
            catch (error) {
                console.log(error);
                browser.close();
            }
            page.close();
            console.log(content.join(' '));
            if (content === null)
                return {
                    status: 'failure',
                    message: 'No article found',
                };
            return {
                status: 'success',
                title: title,
                text: content,
            };
        });
        // Use Promise.all to run the scrapeContent function concurrently for all URIs
        yield Promise.all(URIs.map((URI) => __awaiter(this, void 0, void 0, function* () {
            const result = yield scrapeContent(URI);
            results.push(result);
        })));
        browser.close();
        return results;
    });
}
exports.contentFinderMultiple = contentFinderMultiple;
exports.default = {
    contentFinder,
    contentFinderMultiple,
};
