import { EfinanceiraLoteCriptografador } from './EfinanceiraLoteCriptografador.js';
import * as fs from 'fs';

// Função que você vai chamar após os Workers assinarem os 50/100 eventos
async function finalizarLote(eventosAssinados: Array<{ idGov: string, xmlAssinado: string }>) {

  // 1. Monta o Lote de Eventos "Cru" (Sem criptografia ainda)
  let xmlLoteBruto = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xmlLoteBruto += `<eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteEventos/v1_0_1">\n`;
  xmlLoteBruto += `  <loteEventos>\n`;

  eventosAssinados.forEach((evento) => {
    xmlLoteBruto += `    <evento id="${evento.idGov}">\n`;
    xmlLoteBruto += `      ${evento.xmlAssinado}\n`;
    xmlLoteBruto += `    </evento>\n`;
  });

  xmlLoteBruto += `  </loteEventos>\n`;
  xmlLoteBruto += `</eFinanceira>`;

  // 2. Lê a Chave Pública da Receita Federal (Você precisa baixar isso do Serpro/e-CAC)
  const pubKeyReceita = fs.readFileSync('./certificados/receita_public_key.pem', 'utf8');

  // O Thumbprint é o identificador único do certificado que a Receita exige
  const thumbprintReceita = "A1B2C3D4E5...";

  // 3. Aplica a Magia da Criptografia (O script C# traduzido)
  const criptografador = new EfinanceiraLoteCriptografador();
  const xmlLoteParaTransmissao = criptografador.handle(
    xmlLoteBruto,
    pubKeyReceita,
    thumbprintReceita
  );

  console.log("Lote 100% Criptografado e Pronto!");
  console.log(xmlLoteParaTransmissao);

  // Aqui você pode salvar em arquivo para testar ou mandar via API SOAP
  // fs.writeFileSync('./LoteCriptografado.xml', xmlLoteParaTransmissao);
}