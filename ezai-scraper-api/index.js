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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var cors_1 = __importDefault(require("cors"));
require("dotenv").config();
var _a = require("openai"), Configuration = _a.Configuration, OpenAIApi = _a.OpenAIApi;
var configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
var openai = new OpenAIApi(configuration);
var app = (0, express_1.default)();
var port = process.env.PORT || 8082;
app.use(express_1.default.json());
//allow requests from localhost
app.use((0, cors_1.default)({ origin: false }));
//Get notes from a url
app.post("/notes", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    //Fetch notes from open api
    function getNote(chunk) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, openai.createCompletion("text-babbage-001", {
                                prompt: "\n        create a bullet point list of short notes from key topics in articles using \"->\" as the bullet point for each note:\n        Text:Bob is a boy who loves grasshoppers. He is 11 years old, has blonde hair, and likes to play fortnite 12 hours per day.\n        Notes: ->Bob is a boy. ->Bob is 11 years old. ->Bob has blonde hair. ->Bob likes playing fortnite 12 hours a day.\n\n        Text:".concat(chunk, "\n        Notes: ->"),
                                temperature: 0.9,
                                max_tokens: 700,
                                top_p: 1.0,
                                frequency_penalty: 0.5,
                                presence_penalty: 0.5,
                            })];
                    case 1:
                        response = _a.sent();
                        console.log(response.data.choices[0]);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.log(error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/, response.data.choices[0].text];
                }
            });
        });
    }
    var URI, browser, page, error_1, title, textContent, error_2, content, splitContent, words, i, i, returnedNotes, notes, error_3, parsedNotes, removeNewLine, completeNotes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                URI = req.body.URI;
                console.log(URI);
                return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: true,
                        args: [
                            "--disable-gpu",
                            "--disable-dev-shm-usage",
                            "--disable-setuid-sandbox",
                            "--no-sandbox",
                        ]
                    })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, page.goto(URI, {
                        waitUntil: "domcontentloaded",
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                return [2 /*return*/, res.json({ status: "failure", message: "Page not found.", response: null })];
            case 6: return [4 /*yield*/, page.title()];
            case 7:
                title = _a.sent();
                _a.label = 8;
            case 8:
                _a.trys.push([8, 10, , 12]);
                return [4 /*yield*/, page.evaluate(function () {
                        var article;
                        var text = [];
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
                            article.querySelectorAll("p").forEach(function (p) {
                                text.push(p.innerText);
                            });
                        }
                        else {
                            text = null;
                        }
                        return text;
                    })];
            case 9:
                textContent = _a.sent();
                return [3 /*break*/, 12];
            case 10:
                error_2 = _a.sent();
                console.log(error_2);
                return [4 /*yield*/, browser.close()];
            case 11:
                _a.sent();
                return [2 /*return*/, res.json({ status: "failure", message: "Problem finding article" })];
            case 12: return [4 /*yield*/, browser.close()];
            case 13:
                _a.sent();
                if (textContent == null) {
                    return [2 /*return*/, res.json({ status: "failure", message: "Problem retrieving article" })];
                }
                //Remove all empty items from array
                textContent.forEach(function (i) {
                    if (i === "") {
                        textContent.splice(+i, 1);
                    }
                });
                //If no text is found, return failure
                if (textContent.length === 0) {
                    return [2 /*return*/, res.json({ status: "failure", message: "No text found" })];
                }
                content = textContent.join(" ");
                splitContent = [];
                words = content.split(" ");
                if (words.length > 800) {
                    //create an array of 800 word chunks 
                    for (i = 0; i < words.length; i += 800) {
                        splitContent.push(words.slice(i, i + 800).join(" "));
                    }
                    console.log(splitContent);
                }
                else if (words.length > 400) {
                    //create an array of 400 word chunks
                    for (i = 0; i < words.length; i += 400) {
                        splitContent.push(words.slice(i, i + 400).join(" "));
                    }
                }
                else {
                    splitContent.push(words.join(" "));
                }
                _a.label = 14;
            case 14:
                _a.trys.push([14, 16, , 17]);
                return [4 /*yield*/, Promise.allSettled(splitContent.map(getNote))];
            case 15:
                returnedNotes = _a.sent();
                notes = [];
                returnedNotes.forEach(function (note) {
                    if (note.status === "fulfilled") {
                        notes.push(note.value);
                    }
                });
                return [3 /*break*/, 17];
            case 16:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, res.json({ status: "failure", message: "Problem finding notes" })];
            case 17:
                console.log(notes);
                parsedNotes = notes.join("\n").split("->");
                removeNewLine = function (str) {
                    return str.replace(/\n/g, "");
                };
                completeNotes = [];
                parsedNotes.forEach(function (note) {
                    completeNotes.push(removeNewLine(note).trim());
                });
                if (completeNotes.includes("")) {
                    completeNotes.splice(completeNotes.indexOf(""), 1);
                }
                if (completeNotes.length > 0) {
                    res.status(200).json({ status: "success", message: "Notes Created", notes: completeNotes, title: title });
                }
                else {
                    res.status(200).json({ status: "failure", message: "No Notes Found" });
                }
                return [2 /*return*/];
        }
    });
}); });
//Create a summary for a given URL
app.post("/summary", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    //Fetch notes from open api
    function getSummary(chunk) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8, summarizedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, openai.createCompletion("text-babbage-001", {
                                prompt: "\n        Create a short summary with important information from the article below.\n        Article:".concat(chunk, "\n        Summary:"),
                                temperature: 0.9,
                                max_tokens: 700,
                                top_p: 1.0,
                                frequency_penalty: 0.5,
                                presence_penalty: 0.5,
                            })];
                    case 1:
                        response = _a.sent();
                        console.log(response.data.choices[0]);
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.log(error_8);
                        return [2 /*return*/, null];
                    case 3:
                        summarizedText = response.data.choices[0].text;
                        return [2 /*return*/, summarizedText];
                }
            });
        });
    }
    var URI, browser, page, error_5, title, textContent, error_6, content, splitContent, words, i, i, summaryList, summaries, error_7, completeSummary;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                URI = req.body.URI;
                return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: true,
                        args: [
                            "--disable-gpu",
                            "--disable-dev-shm-usage",
                            "--disable-setuid-sandbox",
                            "--no-sandbox",
                        ]
                    })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, page.goto(URI, {
                        waitUntil: "domcontentloaded",
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_5 = _a.sent();
                return [2 /*return*/, res.json({ status: "failure", message: "Page not found.", response: null })];
            case 6: return [4 /*yield*/, page.title()];
            case 7:
                title = _a.sent();
                console.log("TITLE: " + title);
                _a.label = 8;
            case 8:
                _a.trys.push([8, 10, , 11]);
                return [4 /*yield*/, page.evaluate(function () {
                        var article;
                        var text = [];
                        console.log(document.querySelector('body').innerText);
                        //Select the article
                        if (document.querySelector("article")) {
                            article = document.querySelector("article");
                        }
                        else if (document.querySelector('.main-article')) {
                            article = document.querySelector('.main-article');
                        }
                        else if (document.querySelector('.article-body')) {
                            article = document.querySelector('.article-body');
                        }
                        else if (document.querySelector('.article-content')) {
                            article = document.querySelector('.article-content');
                        }
                        else if (document.querySelector('.article-body-content')) {
                            article = document.querySelector('.article-body-content');
                        }
                        else if (document.querySelector('.content')) {
                            article = document.querySelector('.content');
                        }
                        else if (document.querySelector('.content-area')) {
                            article = document.querySelector('.content-area');
                        }
                        else if (document.querySelector('.article-details')) {
                            article = document.querySelector('.article-details');
                        }
                        else if (document.querySelector('.blog-entry')) {
                            article = document.querySelector('.blog-entry');
                        }
                        else {
                            article = null;
                        }
                        //select all paragraph tags from the article
                        if (article != null) {
                            article.querySelectorAll("p").forEach(function (p) {
                                text.push(p.innerText);
                            });
                        }
                        else {
                            text = null;
                        }
                        return text;
                    })];
            case 9:
                textContent = _a.sent();
                return [3 /*break*/, 11];
            case 10:
                error_6 = _a.sent();
                console.log(error_6);
                return [2 /*return*/, res.json({ status: "failure", message: "Problem finding article" })];
            case 11: return [4 /*yield*/, browser.close()];
            case 12:
                _a.sent();
                if (textContent === null) {
                    return [2 /*return*/, res.json({ status: "failure", message: "Problem retrieving article" })];
                }
                //Remove all empty items from array
                textContent.forEach(function (i) {
                    if (i === "") {
                        textContent.splice(+i, 1);
                    }
                });
                //If no text is found, return failure
                if (textContent.length === 0) {
                    return [2 /*return*/, res.json({ status: "failure", message: "No text found" })];
                }
                content = textContent.join(" ");
                splitContent = [];
                words = content.split(" ");
                if (words.length > 800) {
                    //create an array of 800 word chunks 
                    for (i = 0; i < words.length; i += 800) {
                        splitContent.push(words.slice(i, i + 800).join(" "));
                    }
                    console.log(splitContent);
                }
                else if (words.length > 400) {
                    //create an array of 400 word chunks
                    for (i = 0; i < words.length; i += 400) {
                        splitContent.push(words.slice(i, i + 400).join(" "));
                    }
                }
                else {
                    splitContent.push(words.join(" "));
                }
                summaryList = [];
                _a.label = 13;
            case 13:
                _a.trys.push([13, 15, , 16]);
                return [4 /*yield*/, Promise.allSettled(splitContent.map(getSummary))];
            case 14:
                summaries = _a.sent();
                if (summaries.length > 0) {
                    summaries.forEach(function (summary) {
                        if (summary.status === "fulfilled" && summary.value !== null) {
                            summary.value.replace(/\n/g, "");
                            summaryList.push(summary.value.trim());
                        }
                    });
                }
                else {
                    return [2 /*return*/, res.json({ status: "failure", message: "Could not summarize article." })];
                }
                return [3 /*break*/, 16];
            case 15:
                error_7 = _a.sent();
                console.log(error_7);
                return [2 /*return*/, res.json({ status: "failure", message: "Problem finding Summary" })];
            case 16:
                completeSummary = summaryList.join("\n");
                if (completeSummary) {
                    return [2 /*return*/, res.json({ status: "success", message: "Summary created", summary: completeSummary, title: title })];
                }
                else {
                    return [2 /*return*/, res.json({ status: "failure", message: "No summary found." })];
                }
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
