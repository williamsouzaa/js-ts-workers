import { parentPort, workerData, getEnvironmentData } from 'worker_threads';

const myId = workerData.id;
console.log(`[Worker ${myId}] Iniciando`);

parentPort.on('message', (msg) => {
  console.log(`[Worker ${myId}] msg:`, msg);

  const decoder = new TextDecoder('utf-8');
  const msgDecoded = decoder.decode(msg);
  console.log(`[Worker ${myId}] msg:`, msgDecoded);
  console.log(getEnvironmentData('SECRET_MANAGER_REDIS'));
  parentPort.postMessage({
    workerId: myId,
    resposta: `fim do processamento ${myId}!`
  });
  if (myId === 1) {
    setTimeout(() => {
      console.log(`[Worker ${myId}] finalizando...`);
      process.exit(0);
    }, 5000);
  } else {
    process.exit(0);
  }
});