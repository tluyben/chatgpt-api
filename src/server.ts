import * as dotenv from 'dotenv'
import delay from 'delay'
import express from 'express'
import { oraPromise } from 'ora'

import { ChatGPTAPIBrowser } from './chatgpt-api-browser'
import { Dalle } from './dalle-node'

dotenv.config()

/**
 * Example CLI for testing functionality.
 */
async function main() {
  const api = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD
  })
  await api.initSession()

  const app = express()
  let port = 3001

  // read the prot from environment variable CHATGPT_PORT
  if (process.env.CHATGPT_PORT) {
    port = parseInt(process.env.CHATGPT_PORT)
  }

  let lastSeen = 0
  let response = null

  app.get('/api/send', async (req, res) => {
    const message = req.query.message as string
    response = await api.sendMessage(message, {
      conversationId: response?.conversationId,
      parentMessageId: response?.messageId
    })

    console.log('responses', response.response)
    res.send([response.response])
  })

  // see; https://www.npmjs.com/package/dalle-node how to get the sess key
  if (process.env.DALLE_API_KEY) {
    console.log(
      'Dalle is being used under /api/dalle with key ',
      process.env.DALLE_API_KEY
    )
    const dalle = new Dalle(process.env.DALLE_API_KEY)
    //const last10Runs = await dalle.list({ limit: 10 });
    //console.log('last10Runs', last10Runs)
    let credits = await dalle.getCredits()
    console.log('Credits left', credits.aggregate_credits)
    app.get('/api/dalle', async (req, res) => {
      const message = req.query.message as string
      const response = await dalle.generate(message)
      console.log(response)
      res.send(response)
      credits = await dalle.getCredits()
      console.log('Credits left', credits.aggregate_credits)
    })
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

main().then((res) => {
  console.log(res)
})
