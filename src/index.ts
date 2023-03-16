import express from 'express';
import cors from 'cors';
require('dotenv').config();
import { fetchSummary, fetchSummaries } from './controllers/summaryController';
import {
    fetchNotes,
    fetchNotesMultipleSites,
} from './controllers/notesController';

const app = express();
const port = process.env.PORT || 8082;

app.use(express.json());
app.use(cors());

app.post('/notes', fetchNotes);
app.post('/summary', fetchSummary);
app.post('/summaries', fetchSummaries);
app.post('/notesli', fetchNotesMultipleSites);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
