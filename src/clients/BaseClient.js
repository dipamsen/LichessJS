const { EventEmitter } = require("events");
const { Events } = require("../util/Constants");
const { Structures } = require("../structures");
const Game = require("../structures/Game");
const APIManager = require("../managers/APIManager");

class BaseClient extends EventEmitter {
  async login(token) {
    if (!token) throw new Error("Invalid Token - " + token);
    this.token = token;
    this.api = new APIManager(token);
    const data = await this.api.get("/api/account");
    if (data.error) throw new Error("API Error - " + data.error);
    this._patch(data);
    const emitor = this.api.stream("/api/stream/event");
    const client = this;
    emitor.on("data", async (data) => {
      const object = await Structures[Events[data.type]].create(client, data);
      if (Structures[Events[data.type]] == Game) object.startStreaming();
      client.emit(data.type, object);
    });
  }
  async challenge() {
    // const data = await this.api.post(`https://lichess.org/api/challenge/${user}`);
  }
  get id() {
    return this.user.id;
  }
}

module.exports = BaseClient;
