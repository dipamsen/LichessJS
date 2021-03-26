class User {
  constructor(client, id) {
    this.client = client;
    this.id = id;
    this.update();
  }
  _patch(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.createdAt = new Date(userData.createdAt);
    this.lastOnline = new Date(userData.seenAt);
    this.followerCount = userData.nbFollowers;
  }
  is(id) {
    return this.id == id;
  }
  async update() {
    const userData = await this.client.api.get(`/api/user/${this.id}`);
    this._patch(userData);
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.client.type == "bot" ? "Bot" : ""}User(${this.id})`;
  }
  toString() {
    return `${this.client.type == "bot" ? "Bot" : ""}User(${this.id})`;
  }
}

module.exports = User;
