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
const puppeteer_1 = __importDefault(require("puppeteer"));
function contentFinder(URI) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-sandbox",
            ]
        });
        //Open new page
        const page = yield browser.newPage();
        //Try going to provided url
        try {
            page.setDefaultNavigationTimeout(0);
            yield page.goto(URI, {
                waitUntil: "domcontentloaded",
                timeout: 0
            });
        }
        catch (error) {
            console.log(error);
            return { status: "failure", message: "Error navigating to web page." };
        }
        const title = yield page.title();
        try {
            var textContent = yield page.evaluate(() => {
                let article;
                let text = [];
                console.log(document.querySelector('body').innerText);
                //Select the article
                if (document.querySelector("article")) {
                    article = document.querySelector("article");
                    console.log("Article found");
                }
                else if (document.querySelector('.main-article')) {
                    article = document.querySelector('.main-article');
                    console.log(".main-article found");
                }
                else if (document.querySelector('.article-body')) {
                    article = document.querySelector('.article-body');
                    console.log(".article-body found");
                }
                else if (document.querySelector('.article-content')) {
                    article = document.querySelector('.article-content');
                    console.log(".article-content found");
                }
                else if (document.querySelector('.article-body-content')) {
                    article = document.querySelector('.article-body-content');
                    console.log(".article-body-content found");
                }
                else if (document.querySelector('.content')) {
                    article = document.querySelector('.content');
                    console.log(".content found");
                }
                else if (document.querySelector('.content-area')) {
                    article = document.querySelector('.content-area');
                    console.log(".content-area found");
                }
                else if (document.querySelector('.article-details')) {
                    article = document.querySelector('.article-details');
                    console.log(".article-details found");
                }
                else {
                    return null;
                }
                //select all paragraph tags from the article
                if (article != null) {
                    article.querySelectorAll("p").forEach((p) => {
                        text.push(p.innerText);
                    });
                }
                else {
                    text = null;
                }
                return text;
            });
        }
        catch (error) {
            console.log(error);
            yield browser.close();
            return { status: "failure", message: "Problem evaluating web page." };
        }
        yield browser.close();
        if (textContent === null)
            return { status: "failure", message: "No article found" };
        return { status: "success", title: title, text: textContent };
    });
}
exports.default = contentFinder;
