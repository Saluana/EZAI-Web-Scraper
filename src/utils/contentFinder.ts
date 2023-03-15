import puppeteer, { Browser } from 'puppeteer';
import { SuccessMessage, ErrorMessage } from '../types/types';

const browserInstance = async () => {
    if (process.env.BROWSERLESS_API_KEY) {
        console.log('Browserless is enabled');
        return await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        });
    }

    try {
        return puppeteer.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-sandbox',
            ],
        });
    } catch (error) {
        console.log(error);
        return;
    }
};

export default async function contentFinder(URI: string) {
    const browser = await browserInstance();
    const page = await browser.newPage();

    // Prevent images, ads, analytics, and stylesheets from being loaded

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (
            [
                'image',
                'stylesheet',
                'font',
                'media',
                'eventsource',
                'websocket',
            ].includes(resourceType)
        ) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto(URI, {
            waitUntil: 'domcontentloaded',
        });
    } catch (error) {
        console.log(error);
        browser.close();
        return { status: 'failure', message: 'Error navigating to web page.' };
    }

    const title = await page.title();

    try {
        var content: string[] | null = await page.evaluate(() => {
            const body = document.querySelector('body');
            const array = new Set();
            let contentWasFound = false;

            // Get all paragraph tags from any div with the class name of article or post or content
            body.querySelectorAll('div').forEach((div) => {
                for (let i = 0; i < div.classList.length; i++) {
                    if (
                        div.classList[i].includes('article') ||
                        div.classList[i].includes('post') ||
                        div.classList[i].includes('content')
                    ) {
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

            return Array.from(array) as string[];
        });
    } catch (error) {
        console.log(error);
        browser.close();
    }
    browser.close();

    console.log(content.join(' '));
    if (content === null)
        return {
            status: 'failure',
            message: 'No article found',
        } as ErrorMessage;
    return { status: 'success', title: title, text: content } as SuccessMessage;
}
