# LichessJS

A JavaScript library for interacting with the Lichess Bot/Board API

## Installation

```
npm i lichessjs
```

## Example Usage

```js
const Lichess = require("lichessjs");

const client = new Lichess.BotClient();

const currentGames = new Set();

client.on("challenge", async (challenge) => {
  const game = await challenge.accept();
  currentGames.add(game);
  game.on("myTurn", () => {
    const possibleMoves = game.possibleMoves;
    const move =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    game.move(move);
  });
  game.on("end", () => {
    currentGames.delete(game);
  });
});

client.login(process.env.BOT_TOKEN);
```

## Contributing

Feel free to open a new issue/PR to this repo!

## License

[MIT](./LICENSE)
