// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Translate } from '@google-cloud/translate/build/src/v2'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"

const CREDENTIALS = JSON.parse(process.env.GOOGLE_SERVICE_JSON || "{}")
const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id
});

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);
const ask = async (messages: ChatCompletionRequestMessage[]) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages
  }).catch(e => {
    console.log(JSON.stringify(e.response.data))
    throw e
  });

  return completion
}

const translateIt = async (text: string, target: "mn" | "en") => {
  const [translation] = await translate.translate(text, target);
  console.log(`Text: ${text}`);
  console.log(`Translation: ${translation}`);
  return translation;
}

let sessions: any = {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = req.body.session;
  if (!session) res.status(400).json({ message: "session required" })
  if (!sessions[session]) sessions[session] = { en: [], mn: [] }

  const en = { role: "user", content: await translateIt(req.body.message, "en") }
  const mn = { role: "user", content: req.body.message }

  sessions[session].en.push(en)
  sessions[session].mn.push(mn)

  const answer = await ask(sessions[session].en);
  const answerMn = await translateIt(answer.data.choices[0].message?.content || "", "mn");

  sessions[session].en.push({ role: "assistant", content: answer.data.choices[0].message?.content })
  sessions[session].mn.push({ role: "assistant", content: answerMn })

  res.status(200).json(sessions[session].mn)
}
