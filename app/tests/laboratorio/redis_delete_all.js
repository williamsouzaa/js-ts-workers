import { createClient } from 'redis';
import { randomInt } from 'crypto'


async function testarRedis() {
  const client = createClient();
  const pipeline = client.multi();
  client.on('error', (err) => console.error('ERROR:', err));

  try {
    await client.connect();



    const indexes = await client.sMembers(`efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#INDEX`);
    console.log('Available indexes:', indexes);
    console.log(await client.sRem(`efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#INDEX`, 'dsadada'));

    // const indexes = (await client.sMembers(`efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#INDEX`)).map(el => `efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#${el}`);

    // const resultadoId1 = await client.hGetAll("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#1615");
    // console.log(resultadoId1)


    // const delete_index = await client.ft.dropIndex("`efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#INDEX", {DD: 1615});
    // console.log(delete_index)

    // const resultadoId2 = await client.hDel("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#1615", 'EVT-1778862077596-324');
    // console.log(resultadoId2)
    // const resultadoId3 = await client.hDel("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#1615", 'EVT-1778862077597-328');
    // console.log(resultadoId3)
    // const resultadoId4 = await client.hDel("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#1615", 'EVT-1778862077597-330');
    // console.log(resultadoId4)

    // const resultadoId5 = await client.hLen("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#3143");
    // console.log(resultadoId5)

    // const resultadoId5_1 = await client.del("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#3143");

    // const resultadoId6 = await client.hLen("efinanceira#003#12345678000199#2026#5#ENTRY_DATA#PACKAGE#3143");
    // console.log(resultadoId6)

  } catch (erro) {
    console.error('Falha na execução do script:', erro);
  } finally {
    console.log('Desconectando...');
    await client.quit();
  }
}

testarRedis();