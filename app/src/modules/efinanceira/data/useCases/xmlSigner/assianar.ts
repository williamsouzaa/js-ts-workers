// import { SignedXml } from 'xml-crypto';
// import * as fs from 'fs';
// import * as path from 'path';
// import { IXmlSigner } from '../../../../../shared/domain/fiscalObligations/IXmlSigner.js';

// export class EfinanceiraXmlSigner implements IXmlSigner {
//   private readonly privateKey: string;
//   private readonly publicCertClean: string;

//   constructor() {
//     // Para altíssima performance, os certificados são carregados na memória
//     // apenas UMA vez quando o Worker sobe (durante a injeção de dependência)
//     const certPath = path.resolve(__dirname, '../storage/certificates');

//     this.privateKey = fs.readFileSync(path.join(certPath, 'chave_privada.pem'), 'utf8');
//     const publicCertRaw = fs.readFileSync(path.join(certPath, 'certificado_publico.pem'), 'utf8');

//     // Limpeza obrigatória para o padrão X509 da Receita Federal
//     this.publicCertClean = publicCertRaw
//       .replace(/-----BEGIN CERTIFICATE-----/g, '')
//       .replace(/-----END CERTIFICATE-----/g, '')
//       .replace(/\r?\n|\r/g, '');
//   }

//   public handle(xmlString: string, idTag: string): string {
//     const sig = new SignedXml();

//     // 1. Configuração dos algoritmos da ICP-Brasil exigidos pela eFinanceira
//     sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
//     sig.signingKey = this.privateKey;

//     // 2. Referência ao ID do evento e Transformações obrigatórias
//     sig.addReference(
//       `//*[@id='${idTag}']`,
//       [
//         'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
//         'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
//       ],
//       'http://www.w3.org/2001/04/xmlenc#sha256'
//     );

//     // 3. Força a geração APENAS da tag X509Data/X509Certificate, como manda o manual
//     sig.keyInfoProvider = {
//       getKeyInfo: () => {
//         return `<X509Data><X509Certificate>${this.publicCertClean}</X509Certificate></X509Data>`;
//       }
//     };

//     // 4. Calcula e insere a assinatura
//     sig.computeSignature(xmlString);

//     // Retorna o XML pronto para validação XSD e envio
//     return sig.getSignedXml();
//   }
// }