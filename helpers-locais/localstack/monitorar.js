// arquivo: monitor.ts
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

async function checarStatusDaFila() {
  try {
    console.log("Consultando o LocalStack...\n");

    const comando = new GetQueueAttributesCommand({
      QueueUrl: QUEUE_URL,
      // Pedimos especificamente os atributos de contagem de mensagens
      AttributeNames: [
        "ApproximateNumberOfMessages",           // Mensagens prontas para serem lidas
        "ApproximateNumberOfMessagesNotVisible", // Mensagens que estão sendo processadas por um Worker agora
        "ApproximateNumberOfMessagesDelayed"     // Mensagens agendadas para o futuro
      ],
    });

    const resposta = await sqsLocalClient.send(comando);

    // O SQS retorna um objeto de chaves e valores. Fazemos um fallback para "0" caso venha vazio.
    const atributos = resposta.Attributes || {};
    const prontas = atributos.ApproximateNumberOfMessages ?? "0";
    const emProcessamento = atributos.ApproximateNumberOfMessagesNotVisible ?? "0";
    const atrasadas = atributos.ApproximateNumberOfMessagesDelayed ?? "0";

    console.log("=== STATUS DA FILA ===");
    console.log(`🟢 Prontas para consumo: ${prontas}`);
    console.log(`🟡 Em processamento (Invisíveis): ${emProcessamento}`);
    console.log(`🔵 Atrasadas/Agendadas: ${atrasadas}`);
    console.log("======================");

  } catch (error) {
    console.error("[LOG][ERRO] Falha ao consultar a fila:", error);
  }
}

checarStatusDaFila();