class User {
  constructor(client, id) {
    Object.defineProperty(this, "client", { value: client });
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
  async update() {
    const userData = await this.client.api.get(`/api/user/${this.id}`);
    this._patch(userData);
  }
}

module.exports = User;