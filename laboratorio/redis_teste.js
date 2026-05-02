import { createClient } from 'redis';
import { randomInt } from 'crypto'

console.log(randomInt(999999999))

async function testarRedis() {
  const client = createClient();
  const pipeline = client.multi();
  client.on('error', (err) => console.error('ERROR:', err));

  try {
    await client.connect();
    const eventBatchToMakeOneRequestToRedis = {
      'ID-1': JSON.stringify({ json: "evento 1...", xml: "xml 1..." }),
      'ID-2': JSON.stringify({ json: "evento 2...", xml: "xml 2..." }),
      'ID-3': JSON.stringify({ json: "evento 3...", xml: "xml 3..." })
    }
    pipeline.sAdd(`EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#INDEX`, 'LOTE1');
    pipeline.hSet('EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#LOTE1', eventBatchToMakeOneRequestToRedis);
    pipeline.sAdd(`EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#INDEX`, 'LOTE2');
    pipeline.hSet('EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#LOTE2', eventBatchToMakeOneRequestToRedis);
    await pipeline.exec();

    const listaDeLotes = (await client.sMembers(`EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#INDEX`)).map(el => `EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#${el}`);
    console.log('listaDeLotes: ', listaDeLotes)

    // --- 2. BUSCANDO UM ID ESPECÍFICO (Direto no alvo, Big 0 Notation - O(1)) ---
    const resultadoId1 = await client.hGet("EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#LOTE1", 'ID-1');
    console.log(JSON.parse(resultadoId1));

    // // --- 3. BUSCANDO TODOS DAQUELE MES ---
    // const todosOsDados = await client.hGetAll(chaveMes);
    // console.log('todos os dados:', todosOsDados); // Exibe o objeto completo

    // for (const [id, payload] of Object.entries(todosOsDados)) {
    //   console.log(`Dados do ${id}:`, JSON.parse(payload));
    // }
    // --- PASSO 3: DELETAR (DEL) ---
    const quantidadeDeletada = await client.hDel('EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#LOTE1', 'ID-1')
    if (quantidadeDeletada === 1) console.log('Chave deletada com sucesso!');

    const quantidadeLoteDeletado = await client.del('EVENTO_RECEBIDO#CNPJ_EMPRESA#202310#LOTE#LOTE1')
    if (quantidadeDeletada === 1) console.log('LOTE deletada com sucesso!');


  } catch (erro) {
    console.error('Falha na execução do script:', erro);
  } finally {
    console.log('Desconectando...');
    await client.quit();
  }
}

testarRedis();