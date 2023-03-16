import axios from 'axios';
import * as cheerio from 'cheerio';
import { SuccessMessage, ErrorMessage } from '../types/types';
import { instanceOfError } from './instanceCheck';
const fetchHtml = async (url: string) => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export async function contentFinder(URI: string) {
    const html = await fetchHtml(URI);
    if (!html) {
        return {
            status: 'failure',
            message: 'Error fetching web page.',
        } as ErrorMessage;
    }

    const $ = cheerio.load(html);
    const title = $('title').text();

    const content: string[] = [];
    $('*').each((_, element) => {
        const classNames = $(element).attr('class');
        if (
            classNames &&
            (classNames.includes('article') ||
                classNames.includes('post') ||
                classNames.includes('content'))
        ) {
            $(element)
                .find('p')
                .each((_, p) => {
                    const text = $(p).text();
                    if (text.split(' ').length > 20) {
                        content.push(text);
                    }
                });
        }
    });

    console.log(content.join(' '));
    if (content.length === 0) {
        return {
            status: 'failure',
            message: 'No article found',
        } as ErrorMessage;
    }

    return { status: 'success', title: title, text: content } as SuccessMessage;
}

export async function contentFinderMultiple(URIs: string[]) {
    let results: (SuccessMessage | ErrorMessage)[] = [];

    const promises = URIs.map(async (URI) => {
        const page = await contentFinder(URI);
        if (instanceOfError(page) || page.status === 'failure') {
            return {
                status: 'failure',
                message: 'Page not found.',
                url: URI,
            };
        }

        return {
            status: 'success',
            title: page.title,
            text: page.text,
            url: URI,
        };
    });

    results = await Promise.all(promises);

    return results;
}

export default {
    contentFinder,
    contentFinderMultiple,
};
