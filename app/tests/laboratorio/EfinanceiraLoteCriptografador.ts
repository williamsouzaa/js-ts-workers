import * as crypto from 'crypto';

export class EfinanceiraLoteCriptografador {
  /**
   * Criptografa um lote de eventos da e-Financeira no padrão assíncrono.
   * * @param xmlLote O XML completo contendo a tag <loteEventos> com os eventos assinados.
   * @param certificadoReceitaPem A chave pública do certificado da Receita Federal (em formato PEM).
   * @param thumbprintCertificado O Thumbprint (hash) do certificado da Receita Federal.
   * @returns O XML final <eFinanceira> com o lote criptografado.
   */
  public handle(xmlLote: string, certificadoReceitaPem: string, thumbprintCertificado: string): string {

    // 1. Geração das Chaves Aleatórias (Equivalente ao GerarChaveRandomica do C#)
    // O AES-128 exige uma chave de 16 bytes e um Vetor de Inicialização (IV) de 16 bytes
    const aesKey = crypto.randomBytes(16);
    const aesIv = crypto.randomBytes(16);

    // 2. Encriptar o XML do Lote com AES-128-CBC (Equivalente ao EncriptaXmlComChaveAES)
    // O Node.js já usa PKCS7 Padding por padrão no modo CBC, igual ao C#
    const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, aesIv);
    let loteCriptografadoBase64 = cipher.update(xmlLote, 'utf8', 'base64');
    loteCriptografadoBase64 += cipher.final('base64');

    // 3. Encriptar a Chave AES com a Chave Pública da Receita (Equivalente ao EncriptaChaveAESComChavePublica...)
    // Concatena a chave e o IV (16 + 16 = 32 bytes)
    const chaveEivConcatenados = Buffer.concat([aesKey, aesIv]);

    // Encripta usando RSA e PKCS1 Padding (Exatamente como pede o C#)
    const chaveCriptografadaBuffer = crypto.publicEncrypt(
      {
        key: certificadoReceitaPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      chaveEivConcatenados
    );
    const chaveCriptografadaBase64 = chaveCriptografadaBuffer.toString('base64');

    const idLote = crypto.randomUUID();

    const xmlFinal =
`<?xml version="1.0" encoding="utf-8"?>
<eFinanceira xmlns="http://www.eFinanceira.gov.br/schemas/envioLoteCriptografado/v1_2_0">
  <loteCriptografado>
    <id>${idLote}</id>
    <idCertificado>${thumbprintCertificado}</idCertificado>
    <chave>${chaveCriptografadaBase64}</chave>
    <lote>${loteCriptografadoBase64}</lote>
  </loteCriptografado>
</eFinanceira>`;

    return xmlFinal;
  }
}