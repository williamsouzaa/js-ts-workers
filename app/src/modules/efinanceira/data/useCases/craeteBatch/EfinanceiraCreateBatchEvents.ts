import { ICreateBatchEvents } from "../../../../../shared/domain/fiscalObligations/ICreateBatchEvents.js";
import * as crypto from 'crypto';
import { EFINANCEIRA } from "../../../../../environment.js";
import { handleReadFileSync } from "../../../../../utils/handleReadFileSync.js";
import zlib from 'zlib';


export class EfinanceiraCreateBatchEvents implements ICreateBatchEvents<Array<{idGov: string, xmlSigned: string}>> {
  private readonly certGov: string

  constructor() {
    this.certGov = handleReadFileSync(EFINANCEIRA.BASE_PATH_CERT_GOV, EFINANCEIRA.CERT_GOV_FILE_NAME) as string
  }

  public async handle(data: { idGov: string; xmlSigned: string; }[]): Promise<string> {
      let xmlRawBatch = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xmlRawBatch += `<eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteEventos/v1_0_1">\n`;
      xmlRawBatch += `  <loteEventos>\n`;

      data.forEach((el) => {
        xmlRawBatch += `    <evento id="${el.idGov}">\n`;
        xmlRawBatch += `      ${el.xmlSigned}\n`;
        xmlRawBatch += `    </evento>\n`;
      });

      xmlRawBatch += `  </loteEventos>\n`;
      xmlRawBatch += `</eFinanceira>`;

      const gzippedBatchBuffer = zlib.gzipSync(Buffer.from(xmlRawBatch, 'utf8'));

      const aesKey = crypto.randomBytes(16);
      const aesIv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, aesIv);
      const cryptoBatchBuffer = cipher.update(gzippedBatchBuffer);
      const cryptoBatchFinal = cipher.final();

      const cryptoBatchBase64 = Buffer.concat([cryptoBatchBuffer, cryptoBatchFinal]).toString('base64');

      const cryptoKeyBuffer = crypto.publicEncrypt(
        {
          key: this.certGov,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.concat([aesKey, aesIv])
      );

      const cryptoKeyBufferBase64 = cryptoKeyBuffer.toString('base64');

return `<?xml version="1.0" encoding="utf-8"?>
<eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteCriptografado/v1_2_0">
  <loteCriptografado>
    <id>${crypto.randomUUID()}</id>
    <idCertificado>${EFINANCEIRA.CERT_THUMBPRINT}</idCertificado>
    <chave>${cryptoKeyBufferBase64}</chave>
    <lote>${cryptoBatchBase64}</lote>
  </loteCriptografado>
</eFinanceira>`;
  }
}