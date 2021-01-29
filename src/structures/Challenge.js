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
    this.from = data.challenger.id;
    this.to = data.destUser.id;
    this.variant = data.variant.key;
    this.rated = data.rated;
    this.timeControl = data.timeControl;
    this.botPlayer = data.color;
  }
  get url() {
    return "https://lichess.org/" + this.id;
  }
  async accept() {
    const data = await this.client.api.post(`/api/challenge/${this.id}/accept`);
    if (data.ok) return true;
  }
  async decline(reason = "generic") {
    const reasons = ["generic", "later", "tooFast", "tooSlow", "timeControl", "rated", "casual", "standard", "variant", "noBot", "onlyBot"];
    if (!reasons.includes(reason)) throw new Error(`Not a valid reason - ${reason}`);
    const data = await this.client.api.post(`/api/challenge/${this.id}/decline`, { reason });
    if (data.ok) return true;
  }
}

module.exports = Challenge;