// index.js
import {
Worker,
  isMainThread,
  parentPort,
  workerData,
  setEnvironmentData,
  getEnvironmentData,
} from 'worker_threads';
import os from 'os';

const totalCores = os.cpus().length;
console.log(`total de núcleos: ${totalCores}`);
const workersCount = parseInt(totalCores / 2);
console.log(`total de workers: ${workersCount}`);
setEnvironmentData('SECRET_MANAGER_REDIS', '123456789');


const workerPool = [];
for (let i = 1; i <= workersCount; i++) {
  const worker = new Worker('./worker.js', {workerData: { id: i }});
  worker.on('message', (resposta) => {
    console.log(`[Main Thread] resposta worker ${i}:`, resposta);
  });
  worker.on('error', (err) => {
    console.error(`[Main Thread] error worker ${i}:`, err);
  });
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.log(`[Main] O worker morreu com erro. Código de saída: ${code}`);
    } else {
      console.log(`[Main] O worker ${i} finalizou normalmente.`);
    }
  });
  workerPool.push(worker);
}

for(const worker of workerPool) {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode("BIG JSON HERE!!!!");
  const bigJsonHere = uint8Array.buffer;
  worker.postMessage(uint8Array, [uint8Array.buffer]);
}
