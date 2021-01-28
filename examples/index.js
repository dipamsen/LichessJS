const Lichess = require("../src")

const client = new Lichess.BotClient()

const currentGames = new Set()

client.on("challenge", async (challenge) => {
  const game = await challenge.accept()
  currentGames.add(game)
  game.on("myTurn", () => {
    game.move('e4')
  })
  game.on("end", () => {
    currentGames.delete(game)
  })
})

client.login(process.env.BOT_TOKEN)