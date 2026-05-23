import { RedisClientType, createClient } from 'redis'
import { IDatabaseConnect } from '../../../../data/interfaces/application/database/IDatabaseConnect.js'
import { IDatabaseDisconnect } from '../../../../data/interfaces/application/database/IDatabaseDisconnect.js'
import { REDIS } from '../../../../../environment.js'

export class RedisClient implements IDatabaseConnect, IDatabaseDisconnect {
  static client: RedisClientType = createClient({
    username: REDIS.USER,
    password: REDIS.PASSWORD,
    socket: { host: REDIS.HOST, port: REDIS.PORT }
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