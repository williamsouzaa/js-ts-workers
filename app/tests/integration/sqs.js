// arquivo: produtor.ts
import { CreateQueueCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { gerarEvtMovOpFin } from './efn_generator.js'
import { fakerPT_BR } from '@faker-js/faker'

export const sqsLocalClient = new SQSClient({
  region: "us-east-1",
  endpoint: "http://192.10.1.6:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});


export const QUEUE_URL = "http://192.10.1.6:4566/000000000000/fila-de-processamento";

async function iniciarProdutor() {
  try {
    await sqsLocalClient.send(new CreateQueueCommand({ QueueName: "fila-de-processamento" }));
    console.log("[LOG][INFO] Fila garantida no LocalStack!\n");

    const rl = readline.createInterface({ input, output });

    console.log("=== Produtor SQS Interativo Iniciado ===");
    console.log("Digite 'sair' a qualquer momento para encerrar.\n");

    while (true) {
      const resposta = await rl.question('Quantas mensagens deseja enviar para a fila? : ');

      if (resposta.toLowerCase() === 'sair') {
        console.log("Encerrando produtor...");
        rl.close();
        break;
      }

      const quantidade = parseInt(resposta, 10);

      if (isNaN(quantidade) || quantidade <= 0) {
        console.log("[AVISO] Por favor, digite um número inteiro maior que 0.\n");
        continue;
      }

      console.log(`[LOG] Preparando o envio de ${quantidade} eventos de negócio...`);

      const promessasDeEnvio = [];
      const hoje = new Date();

      for (let i = 0; i < quantidade; i++) {
        const seq = fakerPT_BR.number.int({ min: 1, max: 999999999 });
        const payload = {
          id: `ID${String(seq).padStart(13, '0')}`,
          obrigacao: 'efinanceira',
          codLayout: '003',
          ano: hoje.getFullYear(),
          mes: Math.floor(Math.random() * 12) + 1,
          cnpjEmpresa: '12345678000199', // CNPJ Fake de teste
          evento: JSON.stringify(gerarEvtMovOpFin())
        };

        const envio = sqsLocalClient.send(new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(payload)
        }));

        promessasDeEnvio.push(envio);
      }
      await Promise.all(promessasDeEnvio);
      console.log(`[LOG][SUCESSO] ${quantidade} eventos gerados e enviados com sucesso!\n`);
    }

  } catch (error) {
    console.error("[LOG][ERRO] Falha crítica no produtor:", error);
  }
}

iniciarProdutor();