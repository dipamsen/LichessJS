const Game = require("./Game");
const BaseClient = require("../clients/BaseClient");
const User = require("./User");

class Challenge {
  /** @type {BaseClient} */
  /* eslint-disable-next-line */
  client;
  static create(client, data) {
    const obj = new Challenge();
    obj.client = client;
    if (data) obj._patch(data.challenge);
    return obj;
  }
  _patch(data) {
    this.id = data.id;
    this.status = data.status;
    this.from = new User(this.client, data.challenger.id);
    this.to = new User(this.client, data.destUser.id);
    this.variant = data.variant.key;
    this.rated = data.rated;
    this.timeControl = data.timeControl;
    this.botPlayer = data.color;
  }
  get url() {
    return "https://lichess.org/" + this.id;
  }
  async cancel() {
    if (this.from.id !== this.client.id)
      throw new Error(
        `Unable to cancel challenge ${this.id} because the challenge was not created by the logged in user.`
      );
    const data = await this.client.api.post(`/api/challenge/${this.id}/cancel`);
    if (data.ok) return true;
  }
  async accept() {
    if (this.to.id !== this.client.id)
      throw new Error(
        `Unable to accept challenge ${this.id} because the challenge destination user was not the logged in user.`
      );
    const data = await this.client.api.post(`/api/challenge/${this.id}/accept`);
    return data.ok;
  }
  async decline(reason = "generic") {
    if (this.to.id !== this.client.id)
      throw new Error(
        `Unable to decline challenge ${this.id} because the challenge destination user was not the logged in user.`
      );
    const reasons = [
      "generic",
      "later",
      "tooFast",
      "tooSlow",
      "timeControl",
      "rated",
      "casual",
      "standard",
      "variant",
      "noBot",
      "onlyBot",
    ];
    if (!reasons.includes(reason))
      throw new Error(`Not a valid reason - ${reason}`);
    const data = await this.client.api.post(
      `/api/challenge/${this.id}/decline`,
      { reason }
    );
    if (data.ok) return true;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Challenge(${this.id}, ${this.from} -> ${this.to})`;
  }
  toString() {
    return `Challenge(${this.id}, ${this.from} -> ${this.to})`;
  }
}

module.exports = Challenge;
