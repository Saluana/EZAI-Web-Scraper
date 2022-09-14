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
var contentFilter_1 = __importDefault(require("../utils/contentFilter"));
var openaiPrompts_1 = __importDefault(require("../utils/openaiPrompts"));
var contentFinder_1 = __importDefault(require("../utils/contentFinder"));
var instanceCheck_1 = require("../utils/instanceCheck");
function fetchSummary(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var URI, openAiKey, textContent, title, page, error_1, splitContent, completeSummary;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    URI = req.body.URI;
                    openAiKey = req.headers.key ? req.headers.key : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
                    if (openAiKey === "") {
                        return [2 /*return*/, res.status(400).json({ status: "failure", message: "No API key provided" })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, contentFinder_1.default)(URI)];
                case 2:
                    page = _a.sent();
                    if ((0, instanceCheck_1.instanceOfError)(page) || page.status === "failure")
                        return [2 /*return*/, res.status(400).json({ status: "failure", message: "Page not found." })];
                    textContent = page.text;
                    title = page.title;
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [2 /*return*/, res.json({ status: "failure", message: "Problem retrieving article" })];
                case 4:
                    //Remove all empty items from array
                    contentFilter_1.default.removeEmptyStrings(textContent);
                    //If no text is found, return failure
                    if (textContent.length === 0)
                        return [2 /*return*/, res.json({ status: "failure", message: "No text found" })];
                    splitContent = contentFilter_1.default.createContentChunks(textContent);
                    return [4 /*yield*/, openaiPrompts_1.default.getSummary(splitContent, openAiKey)];
                case 5:
                    completeSummary = _a.sent();
                    if (completeSummary) {
                        return [2 /*return*/, res.json({ status: "success", message: "Summary created", summary: completeSummary, title: title })];
                    }
                    else {
                        return [2 /*return*/, res.json({ status: "failure", message: "No summary found." })];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = fetchSummary;
