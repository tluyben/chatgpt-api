import delay from 'delay'
import express from 'express'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from './chatgpt-api'

/**
 * Example CLI for testing functionality.
 */
async function main() {
  const api = new ChatGPTAPI()
  await api.init()

  const isSignedIn = await api.getIsSignedIn()

  if (!isSignedIn) {
    // Wait until the user signs in via the chromium browser
    await oraPromise(
      new Promise<void>(async (resolve, reject) => {
        do {
          try {
            await delay(1000)

            const isSignedIn = await api.getIsSignedIn()

            if (isSignedIn) {
              return resolve()
            }
          } catch (err) {
            return reject(err)
          }
        } while (true)
      }),
      'Please sign in to ChatGPT and dismiss the welcome modal'
    )
  }


  const app = express()
  const port = 3000

  app.get('/api/send', async (req, res) => {
    const message = req.query.message as string
    const response = await api.sendMessage(message)
    const prompts = await api.getPrompts()
    console.log('prompts', prompts)
    const messages = await api.getMessages()
    console.log('messages', messages)
    res.send(messages)
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

}

main().then((res) => {
  console.log(res)
})
