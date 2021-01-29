const User = require("./User");

class Challenge {
  static create(client, data) {
    const obj = new Challenge();
    Object.defineProperty(obj, "client", { value: client });
    if (data) obj._patch(data.challenge);
    return obj;
  }
  _patch(data) {
    this.id = data.id;
    this.status = data.status;
    this.from = new User(data.challenger.id);
    this.to = new User(data.destUser.id);
    this.variant = data.variant.key;
    this.rated = data.rated;
    this.timeControl = data.timeControl;
    this.botPlayer = data.color;
  }
  get url() {
    return "https://lichess.org/" + this.id;
  }
  async cancel() {
    if (this.from.id !== this.client.id) throw new Error(`Unable to accept challenge ${this.id} because the challenge was not created by the logged in user.`);
    const data = await this.client.api.post(`/api/challenge/${this.id}/cancel`);
    if (data.ok) return true;
  }
  async accept() {
    if (this.to.id !== this.client.id) throw new Error(`Unable to accept challenge ${this.id} because the challenge destination user was not the logged in user.`);
    const data = await this.client.api.post(`/api/challenge/${this.id}/accept`);
    if (data.ok) return true;
  }
  async decline(reason = "generic") {
    if (this.to.id !== this.client.id) throw new Error(`Unable to decline challenge ${this.id} because the challenge destination user was not the logged in user.`);
    const reasons = ["generic", "later", "tooFast", "tooSlow", "timeControl", "rated", "casual", "standard", "variant", "noBot", "onlyBot"];
    if (!reasons.includes(reason)) throw new Error(`Not a valid reason - ${reason}`);
    const data = await this.client.api.post(`/api/challenge/${this.id}/decline`, { reason });
    if (data.ok) return true;
  }
}

module.exports = Challenge;