/* eslint-disable indent */
const { removeUnnecessaryProps } = require("../util/functions");
let { Chess } = require("chess.js");
// @ts-ignore
Chess = removeUnnecessaryProps(Chess);
const User = require("./User");
const EventEmitter = require("events");

class Game extends EventEmitter {
  client;
  static async create(client, data) {
    const obj = new Game();
    obj.client = client;
    if (data) await obj._patch(data.game);
    return obj;
  }
  startStreaming() {
    const emitor = this.client.api.stream(
      `/api/${this.client.type}/game/stream/${this.id}`
    );
    const self = this;
    emitor.on("data", (data) => {
      let state;
      switch (data.type) {
        case "gameFull":
          state = data.state;
          break;
        case "gameState":
          state = data;
          break;
        case "chatLine":
          const opponent = this.myColor == "w" ? "Black" : "White";
          if (data.username == "lichess")
            if (data.text == `${opponent} offers draw`) {
              this.emit("drawOffered", {
                async accept() {
                  return await self.offerDraw();
                },
                async decline() {
                  const data = await this.client.api.post(
                    `/api/${this.client.type}/game/${this.id}/draw/no`
                  );
                  if (data.ok) return true;
                  throw new Error(data.error);
                },
              });
            }
          break;
      }
      if (state) {
        this.setMoves(state.moves);
        this.status = state.status;
        const e = this.over ? "end" : this.myTurn ? "myTurn" : "opponentsTurn";
        this.emit(e, this);
      }
    });
  }
  async offerDraw() {
    const data = await this.client.api.post(
      `/api/${this.client.type}/game/${this.id}/draw/yes`
    );
    if (data.ok) return true;
    throw new Error(data.error);
  }
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  // on(event, listener) {
  //   console.log(event, listener);
  // }
  get over() {
    return this.game.game_over();
  }
  get possibleMoves() {
    return this.game.moves();
  }
  async _patch(data) {
    this.id = data.id;
    if ("moves" in data && "players" in data) {
      this.isRated = data.rated;
      this.variant = data.variant;
      this.ratingCategory = data.perf;
      this.speed = data.speed;
      this.createdAt = new Date(data.createdAt);
      this.lastMovedAt = new Date(data.lastMoveAt);
      this.status = data.status;
      this.players = {
        white: new User(this.client, data.players.white.user.id),
        black: new User(this.client, data.players.black.user.id),
      };
      this.setMoves(data.moves);
    } else await this.update(this.id);
  }
  setMoves(moves) {
    this.moves = moves;
    this.game = new Chess();
    for (let move of this.moves.split(" "))
      this.game.move(move, { sloppy: true });
  }
  async update(id) {
    const data = await this.client.api.get(`/game/export/${id}?pgnInJson=true`);
    this._patch(data);
  }
  get myColor() {
    return this.client.user.id == this.players.white.id
      ? "w"
      : this.client.user.id == this.players.black.id
      ? "b"
      : undefined;
  }
  get myTurn() {
    return (
      !this.game.game_over() && this.myColor && this.myColor == this.game.turn()
    );
  }
  debug() {
    console.log(this.game.ascii());
  }
  async playMove(move) {
    const played = this.game.move(move, { sloppy: true });
    if (played) {
      const data = await this.client.api.post(
        `/api/${this.client.type}/game/${this.id}/move/${played.from}${
          played.to
        }${played.promotion || ""}`
      );
      if (data.ok) return true;
      else this.game.undo();
    } else {
      throw new Error(`Invalid Move - ${move}`);
    }
  }
}

module.exports = Game;
