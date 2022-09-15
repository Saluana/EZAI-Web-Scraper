import {Request, Response} from 'express';
import contentFilter from '../utils/contentFilter';
import prompt from '../utils/openaiPrompts';
import contentFinder from '../utils/contentFinder';
import {instanceOfError} from '../utils/instanceCheck';

async function fetchSummary (req: Request, res: Response) {
    const URI = req.body.URI;
    const openAiKey: string = req.headers.key ? req.headers.key as string : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
    
    if (openAiKey === "") {
        return res.status(400).json({status: "failure", message: "No API key provided"});
    }
    let textContent: string[], title: string;

    try {
        const page = await contentFinder(URI);
        if (instanceOfError(page) || page.status === "failure") return res.status(400).json({status: "failure", message: "Page not found."});
        textContent = page.text;
        title = page.title;
    } catch (error) {
        console.log(error)
        return res.json({status: "failure", message: "Problem retrieving article"});
    }

    //Remove all empty items from array
    contentFilter.removeEmptyStrings(textContent);

    //If no text is found, return failure
    if (textContent.length === 0) return res.json({status: "failure", message: "No text found"});
    
    //Split the websites text content into 3 equal chunks
    const splitContent = contentFilter.createContentChunks(textContent);
    
    //Fetch notes from open api
    const completeSummary = await prompt.getSummary(splitContent, openAiKey);

    if (completeSummary.status === "failure") return res.json({completeSummary});

    if (completeSummary){
        return res.json({status: "success", message: "Summary created", summary: completeSummary.summary, title: title});
    } else {
        return res.json({status: "failure", message: "No summary found."});
    }
}

export default fetchSummary