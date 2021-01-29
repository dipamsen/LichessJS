const Lichess = require("../src");

const client = new Lichess.UserClient();

const currentGames = new Set();

client.on("connected", async () => {
  console.log("Connected to User Account - ", client.user);
});

client.on("challenge", async (challenge) => {
  const game = await challenge.accept();
  currentGames.add(game.id);
  game.on("myTurn", () => {
    game.move("e4");
  });
  game.on("end", () => {
    currentGames.delete(game.id);
  });
});

client.login(process.env.ACCESS_TOKEN);