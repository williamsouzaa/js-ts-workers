import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';
import { IXmlSigner } from '../../../../../core/domain/fiscalObligations/IXmlSigner.js';
import { CERT } from '../../../../../environment.js';
import { handleReadFileSync } from '../../../../../utils/handleReadFileSync.js';

export class EfinanceiraXmlSigner implements IXmlSigner<{xmlData: string, idGov: string}> {
  private privateKey!: string;
  private publicCertClean!: string;

  constructor() {
    const p12Asn1 = this.convertPfxFileBufferToFormatCompatibleToNodeForge()
    const p12: forge.pkcs12.Pkcs12Pfx = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, CERT.EFINANCEIRA.GENERIC_COMPANY.CERT_PASSWORD);
    this.setPrivateKeyGetInPFXFileAndConvertingToPem(p12)
    this.setPublicCertPemGetInPFXFileAndConvertingToPem(p12)
  }

  private convertPfxFileBufferToFormatCompatibleToNodeForge(): forge.asn1.Asn1 {
    const pfxBuffer = handleReadFileSync(CERT.EFINANCEIRA.GENERIC_COMPANY.CERT_BASE_PATH + '/generic' as `app/${string}`, 'certificado_empresa.pfx', false) as Buffer<ArrayBuffer>
    const p12Der = forge.util.decode64(pfxBuffer.toString('base64'));
    return forge.asn1.fromDer(p12Der);
  }

  private setPrivateKeyGetInPFXFileAndConvertingToPem(p12: forge.pkcs12.Pkcs12Pfx): void {
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const forgePrivateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag!]?.[0]?.key;
    if (!forgePrivateKey) throw new Error("Chave privada não encontrada no arquivo PFX.");
    this.privateKey = forge.pki.privateKeyToPem(forgePrivateKey);
  }

  private setPublicCertPemGetInPFXFileAndConvertingToPem(p12: forge.pkcs12.Pkcs12Pfx): void {
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const forgeCert = certBags[forge.pki.oids.certBag!]?.[0]?.cert;
    if (!forgeCert) throw new Error("Certificado público não encontrado no arquivo PFX.");
    const publicCertPem = forge.pki.certificateToPem(forgeCert);
    this.publicCertClean = publicCertPem
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

    sig.computeSignature(data.xmlData);
    return sig.getSignedXml();
  }
}