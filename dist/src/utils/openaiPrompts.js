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
var _a = require("openai"), Configuration = _a.Configuration, OpenAIApi = _a.OpenAIApi;
var contentFilter_1 = __importDefault(require("./contentFilter"));
function configureAI(key) {
    var configuration = new Configuration({
        apiKey: key,
    });
    var openai = new OpenAIApi(configuration);
    return openai;
}
/*    NOTE SECTION   */
function getNote(chunk, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var openai, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    openai = configureAI(apiKey);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.createCompletion("text-babbage-001", {
                            prompt: "\n        create a bullet point list of short notes from key topics in articles using \"->\" as the bullet point for each note:\n        Text:Bob is a boy who loves grasshoppers. He is 11 years old, has blonde hair, and likes to play fortnite 12 hours per day.\n        Notes: ->Bob is a boy. ->Bob is 11 years old. ->Bob has blonde hair. ->Bob likes playing fortnite 12 hours a day.\n\n        Text:".concat(chunk, "\n        Notes: ->"),
                            temperature: 0.9,
                            max_tokens: 700,
                            top_p: 1.0,
                            frequency_penalty: 0.5,
                            presence_penalty: 0.5,
                        })];
                case 2:
                    response = _a.sent();
                    console.log(response.data.choices[0]);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/, response.data.choices[0].text];
            }
        });
    });
}
function getNotes(splitContent, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var returnedNotes, notes, error_2, parsedNotes, completeNotes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.allSettled(splitContent.map(function (content) { return getNote(content, apiKey); }))];
                case 1:
                    returnedNotes = _a.sent();
                    notes = [];
                    returnedNotes.forEach(function (note) {
                        if (note.status === "fulfilled") {
                            notes.push(note.value);
                        }
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.log(error_2);
                    return [2 /*return*/, {
                            status: "failure",
                            message: "Problem finding Notes",
                        }];
                case 3:
                    parsedNotes = notes.join("\n").split("->");
                    completeNotes = [];
                    parsedNotes.forEach(function (note) {
                        completeNotes.push(contentFilter_1.default.removeNewLine(note).trim());
                    });
                    if (completeNotes.includes("")) {
                        contentFilter_1.default.removeEmptyStrings(completeNotes);
                    }
                    return [2 /*return*/, { status: "success", notes: completeNotes }];
            }
        });
    });
}
/*      SUMMARY SECTION      */
function getSummaryChunk(chunk, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var openai, response, error_3, summarizedText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    openai = configureAI(apiKey);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.createCompletion("text-babbage-001", {
                            prompt: "\n        Create a short summary with important information from the article below.\n        Article:".concat(chunk, "\n        Summary:"),
                            temperature: 0.9,
                            max_tokens: 700,
                            top_p: 1.0,
                            frequency_penalty: 0.5,
                            presence_penalty: 0.5,
                        })];
                case 2:
                    response = _a.sent();
                    console.log(response.data.choices[0]);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.log(error_3);
                    return [2 /*return*/, null];
                case 4:
                    summarizedText = response.data.choices[0].text;
                    return [2 /*return*/, summarizedText];
            }
        });
    });
}
function getSummary(splitContent, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var summaryList, summaries, error_4, completeSummary;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    summaryList = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.allSettled(splitContent.map(function (chunk) { return getSummaryChunk(chunk, apiKey); }))];
                case 2:
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
                        return [2 /*return*/, { status: "failure", message: "Could not summarize article." }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.log(error_4);
                    return [2 /*return*/, { status: "failure", message: "Problem finding Summary" }];
                case 4:
                    completeSummary = summaryList.join("\n");
                    return [2 /*return*/, { status: "success", summary: completeSummary }];
            }
        });
    });
}
exports.default = { getNotes: getNotes, getSummary: getSummary };
