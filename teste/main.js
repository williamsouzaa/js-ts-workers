import { fork } from 'child_process';
import path from 'path';

console.log('====================================');
console.log('[MAESTRO] Iniciando o orquestrador...');
console.log('====================================\n');

// 1. Cria o processo filho chamando o arquivo worker.js
const worker = fork('./worker.js');

// 2. Escuta as respostas enviadas pelo filho
worker.on('message', (resposta) => {
  if (resposta.status === 'SUCESSO') {
    console.log(`\n[MAESTRO] Recebi a confirmação! Lote ${resposta.loteId} assinado e validado.`);
    console.log(`[MAESTRO] Total processado: R$ ${resposta.totalProcessado}`);

    // Como é só um teste, vamos matar o processo filho e encerrar tudo
    console.log('[MAESTRO] Encerrando o worker e finalizando o sistema...');
    worker.kill();
    process.exit(0);
  }
});

worker.on('error', (erro) => {
  console.error('[MAESTRO] Socorro! O worker deu erro:', erro);
});

// 3. Simula o envio de uma mensagem do SQS para o filho
console.log('[MAESTRO] Enviando lote de dados para o Worker processar...\n');
worker.send({
  comando: 'PROCESSAR_LOTE',
  loteId: 998877,
  movimentacoes: [
    { conta: '123-4', valor: 5000.00 },
    { conta: '987-6', valor: 1500.50 }
  ]
});