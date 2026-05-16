import { Worker, isMainThread, parentPort } from 'worker_threads';
import libxml from 'libxmljs2';



if (isMainThread) {
  console.log('==================================================');
  console.log('[MAIN] Iniciando o teste da libxmljs2 em Workers...');
  console.log('==================================================\n');

  // Cria um Worker apontando para este próprio arquivo
  const worker = new Worker('./test.js');

  worker.on('message', (msg) => {
    console.log('[MAIN] Mensagem recebida do Worker:', msg);
  });

  worker.on('error', (err) => {
    console.error('\n❌ TESTE FALHOU: A libxmljs2 NÃO suporta Worker Threads nativamente.');
    console.error('Motivo do Crash:', err.message);
    console.error('\n=> Conclusão: Você precisará usar o padrão Maestro (child_process.fork) em vez de worker_threads.');
  });

  worker.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ TESTE PASSOU: A libxmljs2 suporta Worker Threads perfeitamente!');
    }
  });

} else {
  // --- DAQUI PARA BAIXO RODA DENTRO DO WORKER ---
  console.log('[WORKER] Thread isolada iniciada com sucesso.');
  console.log('[WORKER] Tentando importar a libxmljs2 (o erro costuma acontecer aqui)...');

  // Se a biblioteca não suportar, ela vai explodir exatamente nesta linha:

  console.log('[WORKER] libxmljs2 importada! Testando o motor em C++...');
  const xml = '<?xml version="1.0" encoding="UTF-8"?><teste>Sucesso!</teste>';
  const doc = libxml.parseXml(xml);

  // Se chegou aqui, funcionou perfeitamente
  parentPort.postMessage(`Parse concluído: Tag raiz é <${doc.root().name()}>`);
}