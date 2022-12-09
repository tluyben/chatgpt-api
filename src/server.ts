import * as dotenv from 'dotenv'
import delay from 'delay'
import express from 'express'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from './chatgpt-api'
import { Dalle } from './dalle-node'

dotenv.config()

/**
 * Example CLI for testing functionality.
 */
async function main() {
  // const api = new ChatGPTAPI()
  // await api.init()

  // const isSignedIn = await api.getIsSignedIn()

  // if (!isSignedIn) {
  //   // Wait until the user signs in via the chromium browser
  //   await oraPromise(
  //     new Promise<void>(async (resolve, reject) => {
  //       do {
  //         try {
  //           await delay(1000)

  //           const isSignedIn = await api.getIsSignedIn()

  //           if (isSignedIn) {
  //             return resolve()
  //           }
  //         } catch (err) {
  //           return reject(err)
  //         }
  //       } while (true)
  //     }),
  //     'Please sign in to ChatGPT and dismiss the welcome modal'
  //   )
  // }
  const api = new ChatGPTAPI({
    sessionToken: process.env.SESSION_TOKEN
  })
  await api.ensureAuth()

  const app = express()
  const port = 3001

  let lastSeen = 0
  app.get('/api/send', async (req, res) => {
    const message = req.query.message as string
    const response = await api.sendMessage(message)
    //const prompts = await api.getPrompts()
    //console.log('prompts', prompts)
    // const messages = await api.getLastMessage()

    console.log('responses', response)
    res.send([response])
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
