"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const instanceCheck_1 = require("./instanceCheck");
const fetchHtml = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        return data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
function contentFinder(URI) {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield fetchHtml(URI);
        if (!html) {
            return {
                status: 'failure',
                message: 'Error fetching web page.',
            };
        }
        const $ = cheerio.load(html);
        const title = $('title').text();
        const content = [];
        $('*').each((_, element) => {
            const classNames = $(element).attr('class');
            if (classNames &&
                (classNames.includes('article') ||
                    classNames.includes('post') ||
                    classNames.includes('content'))) {
                $(element)
                    .find('p')
                    .each((_, p) => {
                    const text = $(p).text();
                    if (text.split(' ').length > 20) {
                        content.push(text);
                    }
                });
            }
        });
        console.log(content.join(' '));
        if (content.length === 0) {
            return {
                status: 'failure',
                message: 'No article found',
            };
        }
        return { status: 'success', title: title, text: content };
    });
}
exports.contentFinder = contentFinder;
function contentFinderMultiple(URIs) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = [];
        const promises = URIs.map((URI) => __awaiter(this, void 0, void 0, function* () {
            const page = yield contentFinder(URI);
            if ((0, instanceCheck_1.instanceOfError)(page) || page.status === 'failure') {
                return {
                    status: 'failure',
                    message: 'Page not found.',
                    url: URI,
                };
            }
            return {
                status: 'success',
                title: page.title,
                text: page.text,
                url: URI,
            };
        }));
        results = yield Promise.all(promises);
        return results;
    });
}
exports.contentFinderMultiple = contentFinderMultiple;
exports.default = {
    contentFinder,
    contentFinderMultiple,
};
