const Lichess = require("../src")

const client = new Lichess.BotClient()

const currentGames = new Set()

client.on("challenge", async (challenge) => {
  const game = await challenge.accept()
  currentGames.add(game)
  game.on("myTurn", (game) => {
    game.move('e4')
  })
  game.on("end", (game) => {
    currentGames.delete(game)
  })
})

client.login(process.env.BOT_TOKEN)