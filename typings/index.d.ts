import { EventEmitter } from 'events';
declare module "lichessjs" {
  export abstract class BaseClient {
    token: string;
    api: APIManager;
    user: User;
    on(event: "connected", callback: (client: BaseClient) => void): void;
    on(event: "challenge", callback: (challenge: Challenge) => void): void;
    login(token: string): Promise<void>;
  }
  export type Client = BaseClient;
  export class APIManager {
    client: Client;
    get(url: string): Promise<any>;
    post(url: string): Promise<any>;
    stream(url: string): EventEmitter;
  }
  export class BotClient extends BaseClient {
    constructor();
  }
  export class UserClient extends BaseClient {
    constructor();
  }
  export class User {
    client: Client;
    id: string;
    username: string;
    createdAt: Date;
    lastOnline: Date;
    followerCount: number;
    static get(id: string): User;
    update(): Promise<void>;
  }
  type Move = string;
  export class Game {
    client: Client;
    on(event: "myTurn", callback: () => void): void;
    on(event: "opponentsTurn", callback: () => void): void;
    on(event: "end", callback: () => void): void;
    over: boolean;
    possibleMoves: Move[];
    myColor?: "w" | "b";
    isRated: boolean;
    variant: string;
    ratingCategory: string;
    speed: string;
    createdAt: Date;
    lastMovedAt: Date;
    status: string;
    players: {
      white: User, black: User
    }
    playMove(move: Move): Promise<boolean>
  }
  export class Challenge {
    client: Client;
    url: string;
    cancel(): Promise<boolean>;
    accept(): Promise<boolean>;
    decline(): Promise<boolean>;
    id: string;
    status: string;
    from: User;
    to: User;
    variant: string;
    rated: boolean;
    timeControl: string;
    me?: "w" | "b"
  }
}