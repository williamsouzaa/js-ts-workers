import { parentPort, workerData, getEnvironmentData } from 'worker_threads';
import { sleep } from '../../../../utils/sleep.js';

function receivedMessage(message:any) {
  return {
    identifier: "queue",
    queue: {
      identifier: "processPakage",
      message: {
        identifier: "received",
        keyGroup: message.keyGroup,
        packageIndex: message.packageIndex
      },
    },
    worker: {
      id: workerData.workerId,
    }
  }
}


parentPort!.on('message', async (message) => {
  try {
    console.log(`START PROCESSAMENTO - WORKER`, workerData.workerId)
    parentPort!.postMessage(receivedMessage(message));
    await sleep(7000)
    console.log(`START PROCESSAMENTO - WORKER`, message)
  } catch (error) {
    console.log(`[LOG][ERROR] - worker.js - call failed: `, workerData.workerId)
  }
});