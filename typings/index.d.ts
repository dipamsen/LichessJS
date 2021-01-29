import { EventEmitter } from 'events';
declare module "lichessjs" {
  export class BaseClient {
    constructor(): BaseClient;
    token: string;
    api: APIManager;
    user: User;
    on(event: "connected", callback: (client: BaseClient) => void): void;
    on(event: "challenge", callback: (challenge: Challenge) => void): void;
    async login(token: string): void;
  }
  export type Client = BaseClient;
  export class APIManager {
    get(url: string): Promise<any>;
    post(url: string): Promise<any>;
    stream(url: string): EventEmitter;
  }
  export class BotClient extends BaseClient { }
  export class UserClient extends BaseClient { }
  export class User {
    client: Client;
    id: string;
    username: string;
    createdAt: Date;
    lastOnline: Date;
    followerCount: number;
    static get(id: string): User;
    async update(): void;
  }
  class Game {

  }
}