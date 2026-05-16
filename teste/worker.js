console.log(`[WORKER] Online e operante! (Meu PID no Sistema Operacional é ${process.pid})`);

// 1. Escuta as ordens enviadas pelo Maestro (Pai)
process.on('message', (mensagemDoPai) => {

  if (mensagemDoPai.comando === 'PROCESSAR_LOTE') {
    console.log(`[WORKER] Recebi a ordem para processar o lote ${mensagemDoPai.loteId}.`);
    console.log(`[WORKER] Movimentações recebidas:`, mensagemDoPai.movimentacoes);

    console.log('[WORKER] Simulando trabalho pesado (montar XML, assinar, validar no C++)...');

    // 2. Simula um atraso de 2 segundos (como se estivesse validando o XSD)
    setTimeout(() => {

      // Faz uma continha boba só para provar que processou algo
      const total = mensagemDoPai.movimentacoes.reduce((acc, mov) => acc + mov.valor, 0);

      console.log(`[WORKER] Trabalho concluído! Avisando o Maestro pelo rádio...\n`);

      // 3. Envia a resposta de sucesso de volta ao Pai
      process.send({
        status: 'SUCESSO',
        loteId: mensagemDoPai.loteId,
        totalProcessado: total
      });

    }, 2000);
  }
});