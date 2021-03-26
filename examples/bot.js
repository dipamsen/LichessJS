/// <reference path="../typings/index.d.ts" />
const Lichess = require("../src");
require("dotenv").config();

const client = new Lichess.BotClient();

const currentGames = new Set();

client.on("connected", async () => {
  console.log("Connected to Bot Account - ", client.user);
});

client.on("challenge", async (challenge) => {
  console.log("Got Challenge", challenge.id);
  if (challenge.from.is("anyLichessUsername")) {
    await challenge.accept();
  }
});

client.on("gameStart", (game) => {
  console.log("Starting Game", game.id);
  currentGames.add(game.id);
  game.on("myTurn", () => {
    console.log("myTurn");
    const moves = game.possibleMoves;
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    game.playMove(randomMove);
  });
  game.on("opponentsTurn", () => {
    console.log("opponentsTurn");
  });

  game.on("drawOffered", (offer) => {
    console.log("Opponent Offered Draw");
    offer.accept();
  });

  game.on("end", () => {
    currentGames.delete(game.id);
  });
});

client.on("gameFinish", async (game) => {
  console.log("Game Ended: ", game.id);
});

client.login(process.env.LICHESS_BOT_TOKEN);
