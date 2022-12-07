const { Configuration, OpenAIApi } = require('openai');
import contentFilter from './contentFilter';
import { SuccessMessage, ErrorMessage } from '../types/types';

function configureAI(key: string) {
    const configuration = new Configuration({
        apiKey: key,
    });

    const openai = new OpenAIApi(configuration);
    return openai;
}

/*    NOTE SECTION   */
async function getNote(chunk: string, apiKey: string): Promise<string | null> {
    const openai = configureAI(apiKey);
    try {
        var response = await openai.createCompletion('text-curie-001', {
            prompt: `
        create a bullet point list of short notes from key topics in articles using "->" as the bullet point for each note, and remove any unwanted text, such as things related to website cookies,  website newletters, and website advertisements.:\n\n
        Text: Bob is a boy who loves grasshoppers. He is 11 years old, has blonde hair, and likes to play fortnite 12 hours per day.\n\n
        Notes: ->Bob is a boy. ->Bob is 11 years old. ->Bob has blonde hair. ->Bob likes playing fortnite 12 hours a day.\n\n
        Text: Pitbulls are muscular dogs with strong jaws. They were originally bred for bull-baiting, but are now used as guard dogs or for dog fighting. Despite their reputation, they can be loving pets with proper training and responsible ownership.\n\n
        Notes: ->Pitbulls are a type of dog known for their muscular build and strong jaws. ->Pitbulls were originally bred for bull-baiting. ->Pitbulls are now used as guard dogs or for dog fighting. ->Pitbulls can be loving pets with proper training and responsible ownership.\n\n
        Text:${chunk}\n\n
        Notes: ->`,
            temperature: 0.9,
            max_tokens: 700,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
        });

        console.log(response.data.choices[0]);
    } catch (error) {
        console.log(error);
        return null;
    }

    return response.data.choices[0].text;
}

async function getNotes(
    splitContent: string[],
    apiKey: string
): Promise<SuccessMessage | ErrorMessage> {
    try {
        var returnedNotes = await Promise.allSettled(
            splitContent.map((content) => getNote(content, apiKey))
        );
        var notes = [];
        returnedNotes.forEach((note) => {
            if (note.status === 'fulfilled') {
                notes.push(note.value);
            }
        });
    } catch (error) {
        console.log(error);
        return {
            status: 'failure',
            message: 'Problem finding Notes',
        } as ErrorMessage;
    }

    const parsedNotes = notes.join('\n').split('->');
    const completeNotes: string[] = [];
    parsedNotes.forEach((note) => {
        completeNotes.push(contentFilter.removeNewLine(note).trim());
    });

    if (completeNotes.includes('')) {
        contentFilter.removeEmptyStrings(completeNotes);
    }

    return { status: 'success', notes: completeNotes } as SuccessMessage;
}

/*      SUMMARY SECTION      */

async function getSummaryChunk(
    chunk: string,
    apiKey: string
): Promise<string | null> {
    const openai = configureAI(apiKey);

    try {
        var response = await openai.createCompletion('text-curie-001', {
            prompt: `
            Write a concise summary of the following article, and remove any unwanted text, such as things related to website cookies,  website newletters, and website advertisements.
            Article:${chunk}
            Summary:`,
            temperature: 0.9,
            max_tokens: 700,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
        });

        console.log(response.data.choices[0]);
    } catch (error) {
        console.log(error);
        return null;
    }
    const summarizedText: string = response.data.choices[0].text;
    return summarizedText;
}

async function getSummary(splitContent: string[], apiKey: string) {
    const summaryList: string[] = [];

    try {
        var summaries = await Promise.allSettled(
            splitContent.map((chunk) => getSummaryChunk(chunk, apiKey))
        );
        if (summaries.length > 0) {
            summaries.forEach((summary) => {
                if (summary.status === 'fulfilled' && summary.value !== null) {
                    summary.value.replace(/\n/g, '');
                    summaryList.push(summary.value.trim());
                }
            });
        } else {
            return {
                status: 'failure',
                message: 'Could not summarize article.',
            };
        }
    } catch (error) {
        console.log(error);
        return { status: 'failure', message: 'Problem finding Summary' };
    }

    const completeSummary: string = summaryList.join('\n');
    return { status: 'success', summary: completeSummary };
}
export default { getNotes, getSummary };
