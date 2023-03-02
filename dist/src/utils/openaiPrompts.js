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
const { Configuration, OpenAIApi } = require('openai');
const contentFilter_1 = __importDefault(require("./contentFilter"));
function configureAI(key) {
    const configuration = new Configuration({
        apiKey: key,
    });
    const openai = new OpenAIApi(configuration);
    return openai;
}
/*    NOTE SECTION   */
function getNote(chunk, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = configureAI(apiKey);
        let response;
        try {
            response = yield openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        //MARKDOWN
                        role: 'system',
                        content: 'I need you to create a bullet point list of short notes from key topics in the text the user has provided. Use "->" as the bullet point for each note. Please remove and ignore any unwanted text, such as things related to website cookies,  website newletters, and website advertisements. Use the example text, and example notes as a guide.',
                    },
                    {
                        //RULES
                        role: 'user',
                        content: 'Penguins are flightless birds that live in cold climates, primarily in Antarctica. They have adapted to their environment by developing thick feathers and a layer of fat, called blubber, to keep warm in the freezing water.',
                    },
                    {
                        //RULES
                        role: 'assistant',
                        content: '->Penguins are flightless birds. ->Live in cold climates, primarily in Antarctica. ->Have adapted to their environment with thick feathers and blubber. ->Blubber helps them stay warm in freezing water.',
                    },
                    {
                        //RULES
                        role: 'user',
                        content: chunk,
                    },
                ],
                temperature: 0.85,
            });
            console.log(response.data.choices[0].message.content);
        }
        catch (error) {
            console.log(error);
            return null;
        }
        return response.data.choices[0].message.content;
    });
}
function getNotes(splitContent, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var returnedNotes = yield Promise.allSettled(splitContent.map((content) => getNote(content, apiKey)));
            var notes = [];
            returnedNotes.forEach((note) => {
                if (note.status === 'fulfilled') {
                    notes.push(note.value);
                }
            });
        }
        catch (error) {
            console.log(error);
            return {
                status: 'failure',
                message: 'Problem finding Notes',
            };
        }
        const parsedNotes = notes.join('\n').split('->');
        const completeNotes = [];
        parsedNotes.forEach((note) => {
            completeNotes.push(contentFilter_1.default.removeNewLine(note).trim());
        });
        if (completeNotes.includes('')) {
            contentFilter_1.default.removeEmptyStrings(completeNotes);
        }
        return { status: 'success', notes: completeNotes };
    });
}
/*      SUMMARY SECTION      */
function getSummaryChunk(chunk, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = configureAI(apiKey);
        let response;
        try {
            response = yield openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        //MARKDOWN
                        role: 'system',
                        content: 'Write a short and concise summary of the text provided by the user. Remove any unwanted text, such as things related to website cookies, website newletters, and website advertisements.',
                    },
                    {
                        //RULES
                        role: 'user',
                        content: chunk,
                    },
                ],
                temperature: 0.85,
            });
        }
        catch (error) {
            console.log(error);
            return null;
        }
        const summarizedText = response.data.choices[0].message.content;
        return summarizedText;
    });
}
function getSummary(splitContent, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const summaryList = [];
        try {
            var summaries = yield Promise.allSettled(splitContent.map((chunk) => getSummaryChunk(chunk, apiKey)));
            if (summaries.length > 0) {
                summaries.forEach((summary) => {
                    if (summary.status === 'fulfilled' && summary.value !== null) {
                        summary.value.replace(/\n/g, '');
                        summaryList.push(summary.value.trim());
                    }
                });
            }
            else {
                return {
                    status: 'failure',
                    message: 'Could not summarize article.',
                };
            }
        }
        catch (error) {
            console.log(error);
            return { status: 'failure', message: 'Problem finding Summary' };
        }
        const completeSummary = summaryList.join('\n');
        return { status: 'success', summary: completeSummary };
    });
}
exports.default = { getNotes, getSummary };
