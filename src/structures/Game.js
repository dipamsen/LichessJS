const { EventEmitter } = require("events")
const { removeUnnecessaryProps } = require("../util/functions")
let { Chess } = require("chess.js")
Chess = removeUnnecessaryProps(Chess)

class Game extends EventEmitter {
  static async create(client, data) {
    const obj = new Game()
    Object.defineProperty(obj, 'client', { value: client })
    if (data) await obj._patch(data.game)
    return obj
  }
  startStreaming() {
    const emitor = this.client.stream(`/api/${this.client.type}/game/stream/${this.id}`)
    emitor.on("data", data => {
      console.log(data)
      let state
      switch (data.type) {
        case "gameFull": state = data.state; break;
        case "gameState": state = data; break;
        case "chatLine": break;
      }
      if (state) {
        this.setMoves(state.moves)
        this.status = state.status
        if (this.over) this.emit("end", this)
        else if (this.myTurn) this.emit("myTurn", this)
        else this.emit("opponentsTurn", this)
      }
    })
  }
  get over() {
    return this.game.game_over()
  }
  get possibleMoves() {
    return this.game.moves()
  }
  async _patch(data) {
    this.id = data.id;
    if ('moves' in data && 'players' in data) {
      this.isRated = data.rated
      this.variant = data.variant
      this.ratingCategory = data.perf
      this.speed = data.speed
      this.createdAt = new Date(data.createdAt)
      this.lastMovedAt = new Date(data.lastMoveAt)
      this.status = data.status
      this.players = {
        white: data.players.white.user.id,
        black: data.players.black.user.id
      }
      this.setMoves(data.moves)
    }
    else await this.update(this.id);
  }
  setMoves(moves) {
    this.moves = moves
    this.game = new Chess()
    for (let move of this.moves.split(" "))
      this.game.move(move, { sloppy: true })
  }
  async update(id) {
    const data = await this.client.get(`/game/export/${id}?pgnInJson=true`)
    this._patch(data)
  }
  get myColor() {
    return this.client.user.id
      == this.players.white
      ? "w"
      : this.client.user.id
        == this.players.black
        ? "b"
        : undefined
  }
  get myTurn() {
    return !this.game.game_over() && (this.myColor && this.myColor == this.game.turn())
  }
  debug() {
    console.log(this.game.ascii())
  }
  async playMove(move) {
    const played = this.game.move(move, { sloppy: true })
    if (played) {
      const data = await this.client.post(`/api/${this.client.type}/game/${this.id}/move/${played.from}${played.to}${played.promotion || ''}`)
      if (data.ok) return true
      else this.game.undo()
    } else {
      throw new Error(`Invalid Move - ${move}`)
    }
  }
}

module.exports = Game