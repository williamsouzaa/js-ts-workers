import { SignedXml } from 'xml-crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IXmlSigner } from '../../../../../shared/domain/fiscalObligations/IXmlSigner.js';

export class EfinanceiraXmlSigner implements IXmlSigner<{xmlData: string, idGov: string}> {
  private readonly privateKey: string;
  private readonly publicCertClean: string;

  constructor() {
    const certificateBasePath = path.resolve(process.cwd(), 'app/src/modules/efinanceira/infra/storage/certificates')
    this.privateKey = fs.readFileSync(path.join(certificateBasePath, 'chave_privada.pem'), 'utf8');
    const publicCertRaw = fs.readFileSync(path.join(certificateBasePath, 'certificado_publico.pem'), 'utf8');

    // Limpeza obrigatória para o padrão X509 da Receita Federal
    this.publicCertClean = publicCertRaw
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\r?\n|\r/g, '');
  }

  public async handle(data: {xmlData: string, idGov: string}): Promise<string> {
    const sig = new SignedXml({
      privateKey: this.privateKey,
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      getKeyInfoContent: () => `<X509Data><X509Certificate>${this.publicCertClean}</X509Certificate></X509Data>`
    });

    sig.addReference({
      xpath: `//*[@id='${data.idGov}']`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
      ],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
    });

    sig.computeSignature(data.xmlData)

    return sig.getSignedXml()
  }
}