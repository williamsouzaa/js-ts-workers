import { RedisClientType, createClient } from 'redis'
import { IDatabaseConnect } from '../../../../data/interfaces/application/database/IDatabaseConnect.js'
import { IDatabaseDisconnect } from '../../../../data/interfaces/application/database/IDatabaseDisconnect.js'
import process from 'node:process';

export class RedisClient implements IDatabaseConnect, IDatabaseDisconnect {
  static client: RedisClientType = createClient({
    username: process.env.DATABASE_REDIS_USER as string,
    password: process.env.DATABASE_REDIS_PASSWORD as string,
    socket: {
      host: process.env.DATABASE_REDIS_HOST as string,
      port: parseInt(process.env.DATABASE_REDIS_PORT as string, 10)
    }
  })

  async connect(): Promise<void> {
    try{
      await RedisClient.client.connect();
    } catch(error) {
      console.error('err')
    }
  }

  async disconnect(): Promise<void> {
    await RedisClient.client.destroy();
  }
}