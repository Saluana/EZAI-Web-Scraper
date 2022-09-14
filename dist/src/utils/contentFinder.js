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
var puppeteer_1 = __importDefault(require("puppeteer"));
function contentFinder(URI) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, error_1, title, textContent, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer_1.default.launch({
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
                    return [2 /*return*/, { status: "failure", message: "Page not found." }];
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
                    return [2 /*return*/, { status: "failure", message: "Problem finding article" }];
                case 12: return [4 /*yield*/, browser.close()];
                case 13:
                    _a.sent();
                    if (textContent === null)
                        return [2 /*return*/, { status: "failure", message: "No article found" }];
                    return [2 /*return*/, { status: "success", title: title, text: textContent }];
            }
        });
    });
}
exports.default = contentFinder;
