const BaseClient = require("./BaseClient")

class BotClient extends BaseClient {
  constructor() {
    super(...arguments)
    this.type = "bot"
  }
  _patch(data) {
    // console.log(data)
    if (data.title !== "BOT") throw new Error("The token which you are using is linked to a User account and not a BOT account.\nIf you want to create a bot account, see https://lichess.org/api#operation/botAccountUpgrade\nIf you want to use your User token, use new UserClient()")
    this.user = {
      id: data.id
    }
  }
}

module.exports = BotClient