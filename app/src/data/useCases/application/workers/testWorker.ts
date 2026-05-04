import { parentPort, workerData, getEnvironmentData } from 'worker_threads';
import { TPostMessageStrucData, TWorkerThreadSucessEventMessageReceived } from './WorkerThread.js';






interface IParentPortWorkerThread {
  handle(structData: TPostMessageStrucData): Promise<void>
}

class ParentPortWorkerThreadQueueProcesssPackage implements IParentPortWorkerThread {
  constructor() {}

  public async handle(structData: TPostMessageStrucData): Promise<void> {
    const decoder = new TextDecoder('utf-8');
    const data = decoder.decode(structData.binaryData);
  }
}


function receivedMessage(structData: TPostMessageStrucData) {
  return {
    identifier: "queue",
    queue: {
      identifier: "processPakage",
      message: {
        identifier: "received",
        keyGroup: structData.queue!.message!.keyGroup,
        packageIndex: structData.queue!.message!.packageIndex
      },
    },
    worker: {
      id: workerData.workerId,
    }
  }
}

export class InitParentPortWorker {
  constructor(
    private workerParentPort: IParentPortWorkerThread,
  ) {}

  public init() {
    parentPort!.on('message', async (message: TPostMessageStrucData) => {
      parentPort!.postMessage(receivedMessage(message))
    })
  }
}



new InitParentPortWorker(
  new ParentPortWorkerThreadQueueProcesssPackage()
).init()