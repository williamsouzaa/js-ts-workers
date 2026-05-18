// import { ICreateBatchEvents } from "../../../../../shared/domain/fiscalObligations/ICreateBatchEvents.js";
// import * as crypto from 'crypto';
// import * as fs from 'fs';
// import path from 'path';
// import zlib from 'zlib'; // ⬅️ 1. Importar o módulo nativo de compressão
// import { EFINANCEIRA } from "../../../../../environment.js";

// export class EfinanceiraCreateBatchEvents implements ICreateBatchEvents<Array<{idGov: string, xmlSigned: string}>> {
//   private publicKey: crypto.KeyObject;

//   constructor() {
//     const certPath = path.resolve(EFINANCEIRA.BASE_PATH_CERT_GOV, EFINANCEIRA.CERT_GOV_FILE_NAME);
//     const certBuffer = fs.readFileSync(certPath);
//     const x509 = new crypto.X509Certificate(certBuffer);
//     this.publicKey = x509.publicKey;
//   }

//   public async handle(data: { idGov: string; xmlSigned: string; }[]): Promise<string> {
//       let xmlRawBatch = `<?xml version="1.0" encoding="UTF-8"?>\n`;
//       xmlRawBatch += `<eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteEventos/v1_0_1">\n`;
//       xmlRawBatch += `  <loteEventos>\n`;

//       data.forEach((el) => {
//         xmlRawBatch += `    <evento id="${el.idGov}">\n`;
//         xmlRawBatch += `      ${el.xmlSigned}\n`;
//         xmlRawBatch += `    </evento>\n`;
//       });

//       xmlRawBatch += `  </loteEventos>\n`;
//       xmlRawBatch += `</eFinanceira>`;

//       // ⬇️ 2. A MÁGICA DO GZIP ENTRA AQUI ⬇️
//       // Comprimimos a string XML gigante e transformamos num Buffer binário
//       const gzippedBatchBuffer = zlib.gzipSync(Buffer.from(xmlRawBatch, 'utf8'));

//       const aesKey = crypto.randomBytes(16);
//       const aesIv = crypto.randomBytes(16);

//       // 3. A Criptografia agora atua em cima do BUFFER ZIPADO, e não mais da String!
//       const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, aesIv);
//       const cryptoBatchBuffer = cipher.update(gzippedBatchBuffer); // Passa o buffer
//       const cryptoBatchFinal = cipher.final();

//       // Junta os pedaços da criptografia e converte TUDO para Base64 de uma vez
//       const cryptoBatchBase64 = Buffer.concat([cryptoBatchBuffer, cryptoBatchFinal]).toString('base64');

//       const cryptoKeyBuffer = crypto.publicEncrypt(
//         {
//           key: this.publicKey,
//           padding: crypto.constants.RSA_PKCS1_PADDING,
//         },
//         Buffer.concat([aesKey, aesIv])
//       );

//       const cryptoKeyBufferBase64 = cryptoKeyBuffer.toString('base64');

//       return `<?xml version="1.0" encoding="utf-8"?>
// <eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteCriptografado/v1_2_0">
//   <loteCriptografado>
//     <id>${crypto.randomUUID()}</id>
//     <idCertificado>${EFINANCEIRA.CERT_THUMBPRINT}</idCertificado>
//     <chave>${cryptoKeyBufferBase64}</chave>
//     <lote>${cryptoBatchBase64}</lote>
//   </loteCriptografado>
// </eFinanceira>`;
//   }
// }