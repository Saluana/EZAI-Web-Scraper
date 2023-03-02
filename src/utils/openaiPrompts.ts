const { Configuration, OpenAIApi } = require('openai');
import contentFilter from './contentFilter';
import { SuccessMessage, ErrorMessage } from '../types/types';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

/*    NOTE SECTION   */
async function getNote(chunk: string, apiKey: string): Promise<string | null> {
    let response;

    try {
        response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    //MARKDOWN
                    role: 'system',
                    content:
                        'I need you to create a bullet point list of short notes from key topics in the text the user has provided. Use "->" as the bullet point for each note. Please remove and ignore any unwanted text, such as things related to website cookies,  website newletters, and website advertisements. Use the example text, and example notes as a guide.',
                },
                {
                    //RULES
                    role: 'user',
                    content:
                        'Penguins are flightless birds that live in cold climates, primarily in Antarctica. They have adapted to their environment by developing thick feathers and a layer of fat, called blubber, to keep warm in the freezing water.',
                },
                {
                    //RULES
                    role: 'assistant',
                    content:
                        '->Penguins are flightless birds. ->Live in cold climates, primarily in Antarctica. ->Have adapted to their environment with thick feathers and blubber. ->Blubber helps them stay warm in freezing water.',
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
    } catch (error) {
        console.log(error);
        return null;
    }

    return response.data.choices[0].message.content;
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
    let response;
    try {
        response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    //MARKDOWN
                    role: 'system',
                    content:
                        'Write a short and concise summary of the text provided by the user. Remove any unwanted text, such as things related to website cookies, website newletters, and website advertisements.',
                },
                {
                    //RULES
                    role: 'user',
                    content: chunk,
                },
            ],
            temperature: 0.85,
        });
    } catch (error) {
        console.log(error);
        return null;
    }
    const summarizedText: string = response.data.choices[0].message.content;
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
