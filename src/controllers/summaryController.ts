import { Request, Response } from 'express';
import contentFilter from '../utils/contentFilter';
import prompt from '../utils/openaiPrompts';
import {
    contentFinder,
    contentFinderMultiple,
} from '../utils/contentFinderCheerio';
import { instanceOfError } from '../utils/instanceCheck';

async function fetchSummary(req: Request, res: Response) {
    const URI = req.body.URI;
    const openAiKey: string = req.headers.key
        ? (req.headers.key as string)
        : process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY
        : '';

    if (openAiKey === '') {
        return res
            .status(400)
            .json({ status: 'failure', message: 'No API key provided' });
    }
    let textContent: string[], title: string;

    try {
        const page = await contentFinder(URI);
        if (instanceOfError(page) || page.status === 'failure')
            return res
                .status(400)
                .json({ status: 'failure', message: 'Page not found.' });
        textContent = page.text;
        title = page.title;
    } catch (error) {
        console.log(error);
        return res.json({
            status: 'failure',
            message: 'Problem retrieving article',
        });
    }

    //Remove all empty items from array
    contentFilter.removeEmptyStrings(textContent);

    //If no text is found, return failure
    if (textContent.length === 0)
        return res.json({ status: 'failure', message: 'No text found' });

    //Split the websites text content into 3 equal chunks
    const splitContent = contentFilter.createContentChunks(textContent);

    //Fetch notes from open api
    const completeSummary = await prompt.getSummary(splitContent, openAiKey);

    if (completeSummary.status === 'failure')
        return res.json({ completeSummary });

    if (completeSummary) {
        return res.json({
            status: 'success',
            message: 'Summary created',
            summary: completeSummary.summary,
            title: title,
        });
    } else {
        return res.json({ status: 'failure', message: 'No summary found.' });
    }
}

async function fetchSummaries(req: Request, res: Response) {
    const URIs = req.body.URIs;
    const openAiKey: string = req.headers.key
        ? (req.headers.key as string)
        : process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY
        : '';

    if (openAiKey === '') {
        return res
            .status(400)
            .json({ status: 'failure', message: 'No API key provided' });
    }

    try {
        const pages = await contentFinderMultiple(URIs);

        const summariesPromises = pages.map(async (page) => {
            if (instanceOfError(page) || page.status === 'failure') {
                return {
                    status: 'failure',
                    message: 'Page not found.',
                    url: page.url,
                };
            }

            let textContent = page.text;
            let title = page.title;

            // Remove all empty items from the array
            contentFilter.removeEmptyStrings(textContent);

            // If no text is found, return failure
            if (textContent.length === 0) {
                return {
                    status: 'failure',
                    message: 'No text found',
                    url: page.url,
                };
            }

            // Split the website's text content into 3 equal chunks
            const splitContent = contentFilter.createContentChunks(textContent);

            // Fetch notes from the open API
            const completeSummary = await prompt.getSummary(
                splitContent,
                openAiKey
            );

            if (completeSummary.status === 'failure') {
                return completeSummary;
            } else {
                console.log('summary created:', title);
                return {
                    status: 'success',
                    summary: completeSummary.summary,
                    title: title,
                    url: page.url,
                };
            }
        });

        const summaries = await Promise.all(summariesPromises);

        return res.json({ status: 'success', summaries: summaries });
    } catch (error) {
        console.log(error);
        return res.json({
            status: 'failure',
            message: 'Problem retrieving articles',
        });
    }
}

export { fetchSummary, fetchSummaries };
