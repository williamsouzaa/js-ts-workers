// arquivo: limpar-fila.ts
import { PurgeQueueCommand } from "@aws-sdk/client-sqs";
import { GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { CreateQueueCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export const sqsLocalClient = new SQSClient({
  region: "us-east-1",
  endpoint: "http://192.10.1.6:4566", // Aponta pro Docker
  credentials: {
    accessKeyId: "test",       // Credencial fake
    secretAccessKey: "test",   // Senha fake
  },
});

export const QUEUE_URL = "http://192.10.1.6:4566/000000000000/fila-de-processamento";

async function limparFilaCompleta() {
  try {
    console.log("[LOG][INFO] Iniciando limpeza total da fila...");

    const comando = new PurgeQueueCommand({
      QueueUrl: QUEUE_URL,
    });

    await sqsLocalClient.send(comando);

    console.log("[LOG][SUCESSO] 🧹 A fila foi purgada com sucesso! Todas as mensagens foram deletadas.");

  } catch (error) {
    console.error("[LOG][ERRO] Falha ao limpar a fila:", error);
  }
}

limparFilaCompleta();