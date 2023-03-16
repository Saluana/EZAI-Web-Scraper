"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const summaryController_1 = require("./controllers/summaryController");
const notesController_1 = require("./controllers/notesController");
const app = (0, express_1.default)();
const port = process.env.PORT || 8082;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post('/notes', notesController_1.fetchNotes);
app.post('/summary', summaryController_1.fetchSummary);
app.post('/summaries', summaryController_1.fetchSummaries);
app.post('/notesli', notesController_1.fetchNotesMultipleSites);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
