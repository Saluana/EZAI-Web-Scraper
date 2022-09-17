import puppeteer, { Browser } from "puppeteer";
import { SuccessMessage, ErrorMessage } from "../types/types";

const browserInstance = async () => { 
    if (process.env.BROWSERLESS_API_KEY) {
        console.log("Browserless is enabled")
        return await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`
        })
    }

    try { 
    return puppeteer.launch({
    headless: true,
    args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
    ]
}) } catch (error) {
    console.log(error)
    return
}
 };


export default async function contentFinder(URI: string): Promise<SuccessMessage | ErrorMessage> {

    const browser = await browserInstance()
    const page = await browser.newPage();

    //Try going to provided url
    try {
    await page.goto(URI, {
        waitUntil: "domcontentloaded",
    });
    } catch (error) {
        console.log(error);
        return {status: "failure", message: "Error navigating to web page."}
    }

    const title = await page.title();
    
    try {
    var textContent: string[] | null = await page.evaluate(()=>{

        let article;
        let text: string[] | null = [];
        console.log(document.querySelector('body').innerText)
        //Select the article
        if (document.querySelector("article")) {
            article = document.querySelector("article");
            console.log("Article found");
        } else if (document.querySelector('.main-article')) {
            article = document.querySelector('.main-article');
            console.log(".main-article found");
        } else if (document.querySelector('.article-body')) {
            article = document.querySelector('.article-body');
            console.log(".article-body found");
        } else if (document.querySelector('.article-content')) {
            article = document.querySelector('.article-content');
            console.log(".article-content found");
        } else if (document.querySelector('.article-body-content')) {
            article = document.querySelector('.article-body-content');
            console.log(".article-body-content found");
        } else if (document.querySelector('.content')) {
            article = document.querySelector('.content');
            console.log(".content found");
        } else if (document.querySelector('.content-area')) {
            article = document.querySelector('.content-area');
            console.log(".content-area found");
        } else if (document.querySelector('.article-details')) {
            article = document.querySelector('.article-details');
            console.log(".article-details found");
        } else {
            return null
        }

        //select all paragraph tags from the article
        if (article != null) {
        article.querySelectorAll("p").forEach((p) => {
        text.push(p.innerText);
        })
        } else {
            text = null
        }

        return text;
    })
    } catch (error) {
    console.log(error);
    browser.close()
    return {status: "failure", message: "Problem evaluating web page."} as ErrorMessage;
    }

    browser.close()
    
    if (textContent === null) return {status: "failure", message: "No article found"} as ErrorMessage;
    return {status: "success", title: title, text: textContent} as SuccessMessage;
}