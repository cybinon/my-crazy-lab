const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const { Translate } = require("@google-cloud/translate").v2
const fs = require("fs")
const CREDENTIALS = JSON.parse(fs.readFileSync("./google-credential.json", { encoding: "utf-8" }))
const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id
});

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);
const messages = [
  { role: "user", content: "Hi" }
]

const ask = async () => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages
  });

  console.log(JSON.stringify(completion.data))
  translateIt(completion.data.choices[0].message.content, "mn")
}

const translateIt = async (text, target) => {
  const [translation] = await translate.translate(text, target);
  console.log(`Text: ${text}`);
  console.log(`Translation: ${translation}`);
}

ask()




