import express from "express";
import puppeteer from "puppeteer";
import cors from "cors"
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

function configureAI (key: string) {
const configuration = new Configuration({
    apiKey: key,
  });

const openai = new OpenAIApi(configuration);
return openai
}

const app = express();
const port = process.env.PORT || 8082;

app.use(express.json());
//allow requests from localhost
app.use(cors({ origin: false }));

//Get notes from a url
app.post("/notes", async (req, res) => {
    const URI: string = req.body.URI;
    const openAiKey: string = req.headers.key ? req.headers.key as string : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";

    if (openAiKey === "") {
        return res.status(400).json({status: "failure", message: "No API key provided"});
    }

    const openai = configureAI(openAiKey);

    console.log(URI)
    //Open new browser 
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ]
    });
    //Open new page
    const page = await browser.newPage();

    //Try going to provided url
    try {
    await page.goto(URI, {
        waitUntil: "domcontentloaded",
    });
    } catch (error) {
        return res.json({status: "failure", message: "Page not found.", response: null});
    }

    const title = await page.title();
    
    try {
    var textContent: string[] | null = await page.evaluate(()=>{

        let article;
        let text: string[] | null = [];
        console.log(document.querySelector('body').innerText)
        //Select the article
        if (document.querySelector("article")) {
            article = document.querySelector("article");
            console.log("Article found");
        } else if (document.querySelector('.main-article')) {
            article = document.querySelector('.main-article');
            console.log(".main-article found");
        } else if (document.querySelector('.article-body')) {
            article = document.querySelector('.article-body');
            console.log(".article-body found");
        } else if (document.querySelector('.article-content')) {
            article = document.querySelector('.article-content');
            console.log(".article-content found");
        } else if (document.querySelector('.article-body-content')) {
            article = document.querySelector('.article-body-content');
            console.log(".article-body-content found");
        } else if (document.querySelector('.content')) {
            article = document.querySelector('.content');
            console.log(".content found");
        } else if (document.querySelector('.content-area')) {
            article = document.querySelector('.content-area');
            console.log(".content-area found");
        } else if (document.querySelector('.article-details')) {
            article = document.querySelector('.article-details');
            console.log(".article-details found");
        } else {
            return null
        }

        //select all paragraph tags from the article
        if (article != null) {
        article.querySelectorAll("p").forEach((p) => {
        text.push(p.innerText);
        })
        } else {
            text = null
        }

        return text;
    })
    } catch (error) {
    console.log(error);
    await browser.close();
    return res.json({status: "failure", message: "Problem finding article"});
    }

    await browser.close();

    if (textContent == null) {
        return res.json({status: "failure", message: "Problem retrieving article"});
    }

    //Remove all empty items from array
    textContent.forEach(i => {
        if (i === "") {
            textContent.splice(+i, 1);
        }
    })
    //If no text is found, return failure
    if (textContent.length === 0) {
        return res.json({status: "failure", message: "No text found"});
    }

    //Split the websites text content into 3 equal chunks
    const content: string = textContent.join(" ")
    let splitContent: string[] = [];
    let words: string[] = content.split(" ")
    if (words.length > 800) {
            //create an array of 800 word chunks 
            for (let i = 0; i < words.length; i += 800) {
                splitContent.push(words.slice(i, i + 800).join(" "));
            }
            console.log(splitContent);
    } else if (words.length > 400){
        //create an array of 400 word chunks
        for (let i = 0; i < words.length; i += 400) {
            splitContent.push(words.slice(i, i + 400).join(" "));
        }
    } else {
        splitContent.push(words.join(" "));
    }
    
    //Fetch notes from open api
    async function getNote (chunk): Promise<string | null> {
    try {
    var response = await openai.createCompletion("text-babbage-001", {
        prompt: `
        create a bullet point list of short notes from key topics in articles using "->" as the bullet point for each note:
        Text:Bob is a boy who loves grasshoppers. He is 11 years old, has blonde hair, and likes to play fortnite 12 hours per day.
        Notes: ->Bob is a boy. ->Bob is 11 years old. ->Bob has blonde hair. ->Bob likes playing fortnite 12 hours a day.\n
        Text:${chunk}
        Notes: ->`,
        temperature: 0.9,
        max_tokens: 700,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      });

      console.log(response.data.choices[0])
    } catch (error) {
    console.log(error);
    return null
    }
      
      return response.data.choices[0].text
    }

    //get the notes from the chunks
    try {
    var returnedNotes = await Promise.allSettled(splitContent.map(getNote));
    var notes = [];
    returnedNotes.forEach((note) => {
        if (note.status === "fulfilled") {
            notes.push(note.value);
        }
    })
    } catch (error) {
    console.log(error);
    return res.json({status: "failure", message: "Problem finding notes"});
    }

    console.log(notes)
    
    const parsedNotes = notes.join("\n").split("->")

    const removeNewLine = (str: string) => {
        return str.replace(/\n/g, "");
    }
    
    //Parse the notes into an array
    const completeNotes: string[] = [];
    parsedNotes.forEach((note) => {
            completeNotes.push(removeNewLine(note).trim());
    })

    if (completeNotes.includes("")) {
        completeNotes.splice(completeNotes.indexOf(""), 1);
    }

    if (completeNotes.length > 0) {
        res.status(200).json({status: "success", message: "Notes Created", notes: completeNotes, title: title});
    } else {
        res.status(200).json({status: "failure", message: "No Notes Found"});
    }
    
})

//Create a summary for a given URL
app.post("/summary", async (req, res) => {
    const URI = req.body.URI;
    const openAiKey: string = req.headers.key ? req.headers.key as string : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
    
    if (openAiKey === "") {
        return res.status(400).json({status: "failure", message: "No API key provided"});
    }

    const openai = configureAI(openAiKey);
    //Open new browser 
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ]
    });
    //Open new page
    const page = await browser.newPage();
    //Try going to provided url
    try {
    await page.goto(URI, {
        waitUntil: "domcontentloaded",
    });
    } catch (error) {
        return res.json({status: "failure", message: "Page not found.", response: null});
    }
    const title = await page.title();
    console.log("TITLE: " + title);
    try {
    var textContent: string[] | null = await page.evaluate(()=>{

        let article: HTMLElement;
        let text: string[] | null = [];
        console.log(document.querySelector('body').innerText)
        //Select the article
        if (document.querySelector("article")) {
            article = document.querySelector("article");
        } else if (document.querySelector('.main-article')) {
            article = document.querySelector('.main-article');
        } else if (document.querySelector('.article-body')) {
            article = document.querySelector('.article-body');
        } else if (document.querySelector('.article-content')) {
            article = document.querySelector('.article-content');
        } else if (document.querySelector('.article-body-content')) {
            article = document.querySelector('.article-body-content');
        } else if (document.querySelector('.content')) {
            article = document.querySelector('.content');
        } else if (document.querySelector('.content-area')) {
            article = document.querySelector('.content-area');
        } else if (document.querySelector('.article-details')) {
            article = document.querySelector('.article-details');
        } else if (document.querySelector('.blog-entry')) {
            article = document.querySelector('.blog-entry');
        } else {
            article = null
        }

        //select all paragraph tags from the article
        if (article != null) {
        article.querySelectorAll("p").forEach((p) => {
        text.push(p.innerText);
        })
    } else {
        text = null;
    }

        return text;
    })
    } catch (error) {
    console.log(error);
    return res.json({status: "failure", message: "Problem finding article"});
    }

    await browser.close();

    if (textContent === null) {
        return res.json({status: "failure", message: "Problem retrieving article"});
    }

    //Remove all empty items from array
    textContent.forEach(i => {
        if (i === "") {
            textContent.splice(+i, 1);
        }
    })
    //If no text is found, return failure
    if (textContent.length === 0) {
        return res.json({status: "failure", message: "No text found"});
    }


    //Split the websites text content into 3 equal chunks
    const content: string = textContent.join(" ")
    let splitContent: string[] = [];
    let words: string[] = content.split(" ")
    if (words.length > 800) {
            //create an array of 800 word chunks 
            for (let i = 0; i < words.length; i += 800) {
                splitContent.push(words.slice(i, i + 800).join(" "));
            }
            console.log(splitContent);
    } else if (words.length > 400){
        //create an array of 400 word chunks
        for (let i = 0; i < words.length; i += 400) {
            splitContent.push(words.slice(i, i + 400).join(" "));
        }
    } else {
        splitContent.push(words.join(" "));
    }
    
    //Fetch notes from open api
    async function getSummary (chunk): Promise<string | null> {
    try {
    var response = await openai.createCompletion("text-babbage-001", {
        prompt: `
        Create a short summary with important information from the article below.
        Article:${chunk}
        Summary:`,
        temperature: 0.9,
        max_tokens: 700,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      });

      console.log(response.data.choices[0])
    } catch (error) {
    console.log(error);
    return null
    }
      const summarizedText: string = response.data.choices[0].text
      return summarizedText
    }

    //get the split summaries from the chunks
    const summaryList: string[] = [];

    try {
    var summaries = await Promise.allSettled(splitContent.map(getSummary));
    if (summaries.length > 0) {
        summaries.forEach(summary => {
            if (summary.status === "fulfilled" && summary.value !== null) {
            summary.value.replace(/\n/g, "")
            summaryList.push(summary.value.trim());
            }
        })
    } else {
        return res.json({status: "failure", message: "Could not summarize article."});
    }
    } catch (error) {
    console.log(error);
    return res.json({status: "failure", message: "Problem finding Summary"});
    }

    const completeSummary: string = summaryList.join("\n");
    if (completeSummary){
        return res.json({status: "success", message: "Summary created", summary: completeSummary, title: title});
    } else {
        return res.json({status: "failure", message: "No summary found."});
    }
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})