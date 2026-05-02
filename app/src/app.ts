import { queueControllerFactory } from "./main/factories/controllers/queue/queueControllerFactory.js";

class App {
  public async handle(): Promise<void> {
    while(true) {
      for (const sqsQueueController of queueControllerFactory()) {
        await sqsQueueController.handle()
      }
    }
  }
}

const app = new App()
app.handle()