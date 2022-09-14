import express from "express";
import cors from "cors"
require("dotenv").config();
import fetchSummary from "./controllers/summaryController";
import fetchNotes from "./controllers/notesController";

const app = express();
const port = process.env.PORT || 8082;

app.use(express.json());
app.use(cors());

app.post("/notes", fetchNotes)
app.post("/summary", fetchSummary)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})