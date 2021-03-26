const { EventEmitter } = require("events");
const https = require("https");
const qs = require("querystring");

class APIManager {
  constructor(token) {
    this.token = token;
  }
  get(url) {
    // console.log(`GET`, url)
    return new Promise((resolve) => {
      const req = https.get(
        `https://lichess.org${url}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk.toString()));
          res.on("end", () => resolve(JSON.parse(data)));
        }
      );
      req.on("error", (e) => {
        console.log(e);
      });
    });
  }
  post(url, data = {}) {
    // console.log(`POST`, url, data)
    return new Promise((resolve) => {
      const postData = qs.stringify(data);
      const req = https.request(
        `https://lichess.org${url}`,
        {
          port: 443,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${this.token}`,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk.toString();
          });
          res.on("close", () => resolve(JSON.parse(data)));
        }
      );

      req.on("error", (e) => {
        throw new Error(e);
      });

      req.write(postData);
      req.end();
    });
  }
  stream(url) {
    const eventEmittor = new EventEmitter();
    const req = https.get(
      `https://lichess.org${url}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      },
      (res) => {
        res.on("data", async (chunk) => {
          const chunkStr = chunk.toString().trim();
          if (!chunkStr) return;
          const data = chunkStr.split("\n").map((str) => JSON.parse(str));
          data.forEach((chunk) => eventEmittor.emit("data", chunk));
        });
      }
    );
    req.on("error", (err) => {
      throw new Error(err);
    });
    req.end();
    return eventEmittor;
  }
}

module.exports = APIManager;
