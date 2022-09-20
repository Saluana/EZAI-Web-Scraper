# EZAI-Web-Scraper

An API that allows you to scrape blog posts and articles and get a list of notes or a summary back.

### Recommendations

1. Use browserless.io for scraping instead of the headless chromium that comes with puppeteer. It's faster and more reliable.
2. For better results changed the language model to text-curie-001 or text-davinci-002. The default model is cheap, but not the greatest.
3. For easiest deployment, use the docker image in the dist folder (Make sure you add the .env variables).
4. If you make a cool feature or find a bug, please consider contributing!

### Enviroment Variables

OPENAI_API_KEY={YOUR API KEY} (Optional. Key can be provided in the request headers)

BROWSERLESS_API_KEY={YOUR API KEY} (Optional. Only needed if you plan on using browserless.io)

PORT={YOUR CHOSEN PORT} (Required)

### How To Run

#### Command Line

Developement: `npm run test`

Production: `npm run start`

#### Docker

_(Does not work on Apple M1 chips)_

CD into the "dist" folder and build the image.

Run the image, but make sure to include the enviroment variables.

I have tested this project on render.com and Google Cloud Run. Both work well and are a good choice.

## API ENDPOINTS

### /notes

- Method: POST
- Parameters:
  - Headers:
    - Key
      - Description: Your OpenAI API key (Only use if you didnt set the OPEN_API_KEY enviroment variable)
      - Type: String
      - Required: False
  - Body
    - URI
      - Description: A link to the website you would like to have notes made from.
      - Type: String
      - Required: True

### /summary

- Method: POST
- Parameters:
  - Headers:
    - Key
      - Description: Your OpenAI API key (Only use if you didnt set the OPEN_API_KEY enviroment variable)
      - Type: String
      - Required: False
  - Body
    - URI
      - Description: A link to the website you would like to have summarized
      - Type: String
      - Required: True

### Example Request

```
const notes = await fetch(https://myapi.com/notes, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Key: "Your OpenAI key"
  },
  body: {
    URI: "https://blog.com/1234"
  }
)
```
