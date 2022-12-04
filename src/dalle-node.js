// this was forked from https://github.com/ezzcodeezzlife/dalle-node
// because the default didn't work for me 

import got from 'got';

export class DalleError extends Error {
  constructor(response) {
    super();
    this.response = response;
  }
}

export class Dalle {
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.url = "https://labs.openai.com/api/labs";
  }

  async generate(prompt) {
    let task = await got.post(`${this.url}/tasks`, {
      json: {
        task_type: "text2im",
        prompt: {
          caption: prompt,
          batch_size: 4,
        },
      },
      headers: {
        Authorization: `Bearer ${this.bearerToken}`
      }
    }).json();

    return await new Promise(resolve => {
      const refreshIntervalId = setInterval(async () => {
        task = await this.getTask(task.id)

        switch (task.status) {
          case "succeeded":
            clearInterval(refreshIntervalId);
            resolve(task.generations)
          case "rejected":
            clearInterval(refreshIntervalId);
            resolve(new DalleError(task.status_information))
          case "pending":
            console.log('pending', task.id)
        }
      }, 2000);
    })
  }

  async getTask(taskId) {
    return await got.get(`${this.url}/tasks/${taskId}`, {
      headers: {
        Authorization: "Bearer " + this.bearerToken,
      },
    }).json();
  }

  async list(options = { limit: 50, fromTs: 0 }) {
    return await got.get(`${this.url}/tasks?limit=${options.limit}${options.fromTs ? `&from_ts=${options.fromTs}` : ''}`, {
      headers: {
        Authorization: "Bearer " + this.bearerToken,
      },
    }).json();
  }

  async getCredits() {
    return await got.get(`${this.url}/billing/credit_summary`, {
      headers: {
        Authorization: "Bearer " + this.bearerToken,
      },
    }).json();
  }
}
