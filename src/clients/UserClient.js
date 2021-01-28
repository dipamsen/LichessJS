const BaseClient = require("./BaseClient")

class UserClient extends BaseClient {
  constructor() {
    super(...arguments)
    this.type = "board"
  }
  _patch(data) {
    console.log(data)
    if (data.title == "BOT") throw new Error("The token which you are using is linked to a Bot account and not a User account.\nIf you want to use your Bot token, use new BotClient()")
    this.user = {
      id: data.id
    }
  }
}

module.exports = UserClient