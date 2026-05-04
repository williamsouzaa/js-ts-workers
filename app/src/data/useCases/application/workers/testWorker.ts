import { parentPort, workerData, getEnvironmentData } from 'worker_threads';
import { sleep } from '../../../../utils/sleep.js';

console.log(`[LOG][INFO] - worker.js - start: `, workerData.workerId);

function receivedMessage(message:any) {
  return {
    message: {
      identifier: "received",
      keyGroup: message.keyGroup,
      packageIndex: message.packageIndex
    },
    worker: {
      id: workerData.workerId,
    }
  }
}





parentPort!.on('message', async (message) => {
  try {
    parentPort!.postMessage(receivedMessage(message));
    await sleep(5000)
  } catch (error) {
    console.log(`[LOG][ERROR] - worker.js - call failed: `, workerData.workerId)
  }
});