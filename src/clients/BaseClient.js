const { EventEmitter } = require("events")
const https = require("https")
const qs = require('querystring')
const { Events } = require("../util/Constants")
const { Structures } = require("../structures")

class BaseClient extends EventEmitter {
  async login(token) {
    this.token = token
    const data = await this.get("/api/account")
    this._patch(data)
    const emitor = this.stream("/api/stream/event")
    const client = this
    emitor.on("data", async data => {
      const object = await Structures[Events[data.type]].create(client, data)
      if (Structures[Events[data.type]] == Game) object.startStreaming()
      client.emit(data.type, object)
    })
  }
  get(url) {
    // console.log(`GET`, url)
    return new Promise((resolve, reject) => {
      const req = https.get(`https://lichess.org${url}`, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
      }, (res) => {
        let data = ''
        res.on("data", chunk => data += chunk.toString())
        res.on('end', () => resolve(JSON.parse(data)))
      })
      req.on('error', (e) => {
        throw new Error(e);
      });
    })
  }
  post(url, data = {}) {
    // console.log(`POST`, url, data)
    return new Promise((resolve, reject) => {
      const postData = qs.stringify(data)
      const req = https.request(`https://lichess.org${url}`, {
        port: 443,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${this.token}`
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => {
          data += chunk.toString()
        });
        res.on('close', () => resolve(data))
      });

      req.on('error', (e) => {
        throw new Error(e);
      });

      req.write(postData);
      req.end();
    })
  }
  stream(url) {
    const eventEmittor = new EventEmitter()
    const req = https.get(`https://lichess.org${url}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    }, (res) => {
      res.on("data", async chunk => {
        const chunkStr = chunk.toString().trim()
        if (!chunkStr) return
        const data = chunkStr.split("\n").map(str => JSON.parse(str))
        data.forEach((chunk) => eventEmittor.emit("data", chunk))
      })
    })
    req.on("error", (err) => {
      throw new Error(err)
    })
    req.end()
    return eventEmittor
  }
}

module.exports = BaseClient