import { RedisClient } from "../infra/databases/connections/redis/RedisConnect.js"
import { queueControllerFactory } from "./factories/controllers/queueControllerFactory.js"
import '../../environment.js'

class App {
  public async handle(): Promise<void> {
    console.log('[LOG][INFO] - App - handle - start')

    this.databases()
    const sqsQueueControllerList = await queueControllerFactory()

    while(true) {
      for (const sqsQueueController of sqsQueueControllerList) {
        await sqsQueueController.handle()
      }
    }
  }

  private async databases(): Promise<void> {
    const redis = new RedisClient()
    await redis.connect()
  }
}

new App().handle()
