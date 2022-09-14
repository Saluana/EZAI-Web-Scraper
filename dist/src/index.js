"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
require("dotenv").config();
var summaryController_1 = __importDefault(require("./controllers/summaryController"));
var notesController_1 = __importDefault(require("./controllers/notesController"));
var app = (0, express_1.default)();
var port = process.env.PORT || 8082;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/notes", notesController_1.default);
app.post("/summary", summaryController_1.default);
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
