import { createClient } from 'redis';
import { randomInt } from 'crypto'

setInterval(() => testarRedis(), 2)
async function testarRedis() {
  const client = createClient();
  const pipeline = client.multi();
  client.on('error', (err) => console.error('ERROR:', err));

  try {
    await client.connect();

    const indexes = await client.keys(`*`);
    console.log(indexes)

  } catch (erro) {
    console.error('Falha na execução do script:', erro);
  } finally {
    console.log('Desconectando...');
    await client.quit();
  }
}