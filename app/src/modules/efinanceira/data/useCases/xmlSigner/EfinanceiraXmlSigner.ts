import { SignedXml } from 'xml-crypto';
import { IXmlSigner } from '../../../../../shared/domain/fiscalObligations/IXmlSigner.js';
import { EFINANCEIRA } from '../../../../../environment.js';
import { handleReadFileSync } from '../../../../../utils/handleReadFileSync.js';

export class EfinanceiraXmlSigner implements IXmlSigner<{xmlData: string, idGov: string}> {
  private readonly privateKey: string;
  private readonly publicCertClean: string;

  constructor() {
    this.privateKey = handleReadFileSync(EFINANCEIRA.BASE_PATH_CERT_COMPANYS + '/generic' as `app/${string}`, 'chave_privada.pem')
    const publicCert = handleReadFileSync(EFINANCEIRA.BASE_PATH_CERT_COMPANYS + '/generic' as `app/${string}`, 'certificado_publico.pem')

    this.publicCertClean = publicCert
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