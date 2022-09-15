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
const contentFilter_1 = __importDefault(require("../utils/contentFilter"));
const openaiPrompts_1 = __importDefault(require("../utils/openaiPrompts"));
const contentFinder_1 = __importDefault(require("../utils/contentFinder"));
const instanceCheck_1 = require("../utils/instanceCheck");
function fetchSummary(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const URI = req.body.URI;
        const openAiKey = req.headers.key ? req.headers.key : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
        if (openAiKey === "") {
            return res.status(400).json({ status: "failure", message: "No API key provided" });
        }
        let textContent, title;
        try {
            const page = yield (0, contentFinder_1.default)(URI);
            if ((0, instanceCheck_1.instanceOfError)(page) || page.status === "failure")
                return res.status(400).json({ status: "failure", message: "Page not found." });
            textContent = page.text;
            title = page.title;
        }
        catch (error) {
            console.log(error);
            return res.json({ status: "failure", message: "Problem retrieving article" });
        }
        //Remove all empty items from array
        contentFilter_1.default.removeEmptyStrings(textContent);
        //If no text is found, return failure
        if (textContent.length === 0)
            return res.json({ status: "failure", message: "No text found" });
        //Split the websites text content into 3 equal chunks
        const splitContent = contentFilter_1.default.createContentChunks(textContent);
        //Fetch notes from open api
        const completeSummary = yield openaiPrompts_1.default.getSummary(splitContent, openAiKey);
        if (completeSummary.status === "failure")
            return res.json({ completeSummary });
        if (completeSummary) {
            return res.json({ status: "success", message: "Summary created", summary: completeSummary.summary, title: title });
        }
        else {
            return res.json({ status: "failure", message: "No summary found." });
        }
    });
}
exports.default = fetchSummary;
