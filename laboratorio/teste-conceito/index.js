import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import './aws_server.js';
import { Worker, isMainThread, parentPort, workerData, setEnvironmentData, getEnvironmentData } from 'worker_threads';
import os from 'os';
import { sleep } from './utils.js';
import { error } from "console";

const awsClientSQS = new SQSClient({ region: "us-east-1" });

async function getBatchMessagesInAWSSQSQueue(batchNumberMessages = 50) {
  try {
    const numberTimesToCall = Math.ceil(batchNumberMessages / 10)

    const functionsList = new Array()
    for (let i = 0; i < numberTimesToCall; i++) {
      functionsList.push(new ReceiveMessageCommand({ QueueUrl: "minha-fila", MaxNumberOfMessages: 10 }))
    }
    const awsSQSResponse = await Promise.all(functionsList.map(func => awsClientSQS.send(func)));
    const messages = awsSQSResponse.filter(el => !!el.Messages).map(el => el.Messages).flat();
    return messages.length === 0 ? null : messages;
  } catch (error) {
    console.error("[LOG][ERROR] - getBatchMessagesInAWSSQSQueue - Erro ao obter mensagens da fila SQS: ", error);
    return null;
  }
}

function initNodejsWorkersThreads() {
  const totalCores = os.cpus().length;
  const workersCount = parseInt(totalCores / 2);
  console.log(`[LOG][INFO] - initNodejsWorkersThreads - cores: ${totalCores}`);
  console.log(`[LOG][INFO] - initNodejsWorkersThreads - workers: ${workersCount}`);

  const workerPool = new Map();
  for (let i = 1; i <= workersCount; i++) {
    const workerName = `appNodejsWorker${i}`;
    const worker = new Worker('./worker.js', { name: workerName, workerData: { workerId: i } } );
    workerPool.set(i, {worker, id: i, name: workerName, status: "idle"});
  }
  return workerPool;
}

function changeStatusWorkerToIdle(message, workerPool) {
  workerPool.get(message.worker.id).status = 'idle'
}

async function handleWithWorkerSuccessMessageEvent(message, workerPool) {
  console.log(`[LOG][INFO] - handleWithWorkerSuccessMessage - message: `, message);
  changeStatusWorkerToIdle(message, workerPool)
  await sleep(300);
  console.log(`[LOG][INFO] - handleWithWorkerSuccessMessage - postou a mesagem no sqs ou algo do tipo`);
}

async function handleWithWorkerErrorEvent(erro, workerPool) {
  console.log(`[LOG][INFO] - handleWithWorkerErrorMessage - erro: `, erro, workerPool);
  changeStatusWorkerToIdle(message, workerPool)
  await sleep(300);
  console.log(`[LOG][INFO] - handleWithWorkerErrorMessage - manda algo de volta pro worker ou faz algo do tipo para tratar o erro`);
}

async function handleWithWorkerExitEvent(code, workerPool) {
  if (code !== 0) console.log(`[LOG][INFO] - listenToWorkersMessages - Worker stopped with exit code ${code}`);
}

function listenToWorkersMessages(workerPool) {
  workerPool.forEach(({worker}) => {
    worker.on('message', (message) => handleWithWorkerSuccessMessageEvent(message, workerPool));
    worker.on('error', (erro) => handleWithWorkerErrorEvent(erro, workerPool));
    worker.on('exit', (code) => handleWithWorkerExitEvent(code, workerPool));
  });
}


function putWorkerToWork(workerPool, message, messageEncoded) {
  for (const [id, el] of workerPool) {
    if (el.status === "idle") {
      el.status = "busy";
      el.worker.postMessage(message, [messageEncoded]);
      break;
    }
  }
}

function allWorkersThreadsAreBusy(workerPool) {
  let allWorkersBusy = true
  for (const [_, el] of workerPool)
    if (el.status !== 'busy') return false
  return allWorkersBusy
}


(async function main() {
  const workerPool = await initNodejsWorkersThreads();
  listenToWorkersMessages(workerPool);

  await sleep(10 * 1000);

  while(true) {
    if (allWorkersThreadsAreBusy(workerPool)){
      console.log('[LOG][INFO] - main - todos os workers running')
      await sleep(50);
      continue
    }

    const messages = await getBatchMessagesInAWSSQSQueue(10);
    if (!messages) {
      console.log(`[LOG][INFO] - main - Nenhuma mensagem encontrada na fila SQS. Aguardando...`);
      await sleep(5000);
      continue;
    }

    for (const message of messages) {
      console.log(`[LOG][INFO] - main - Enviando mensagem para o worker: `, message.Body);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(message.Body);
      const bigStrJsonHere = uint8Array.buffer;
      putWorkerToWork(workerPool, { data: bigStrJsonHere }, bigStrJsonHere);
    }
  }
})();
