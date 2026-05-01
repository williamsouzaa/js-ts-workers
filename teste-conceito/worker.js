import { parentPort, workerData, getEnvironmentData } from 'worker_threads';
import { sleep } from './utils.js';

console.log(`[LOG][INFO] - worker.js - start: `, workerData.workerId);

function sucessResponse(data) {
  return {
      worker: {
        id: workerData.workerId,
        status: "sucess",
      },
      data: data
    }
}

function errorResponse() {
  return {
      worker: {
        id: workerData.workerId,
        status: "error"
      }
    }
}

class WorkerThreadManager {
  async handle(message, messageEncoded) {
    const decoder = new TextDecoder('utf-8');
    const data = decoder.decode(messageEncoded);
    console.log(`[LOG][INFO] - WorkerThreadManager - handle - data:`, data);
    // ADICIONAR TODOS OS PASSOS DO PROCESSAMENTO AQUI...
    // logicaPesadaAqui()
    await sleep(200);
    // [...]
    return "mensagem processada com sucesso"
  }
}

parentPort.on('message', async (message) => {
  try {
    const workerThreadManager = new WorkerThreadManager();
    const result = await workerThreadManager.handle(message, message.data);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(result);
    const bigJsonHere = uint8Array.buffer;
    parentPort.postMessage(sucessResponse(bigJsonHere), [bigJsonHere]);
  } catch (error) {
    console.log(`[LOG][ERROR] - worker.js - call failed: `, workerData.workerId);
    parentPort.postMessage(errorResponse());
  }
});