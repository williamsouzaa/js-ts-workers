import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";
import { randomUUID } from "node:crypto";


(function(){
  const sqsMock = mockClient(SQSClient);

  const filaVirtual = [];

  for (const empresa of ["cnpj_itau_inibanco", "cnpj_seguros", "cnpj_vida_previdencia"]) {
    for (let i = 0; i < 101 ; i++) {
      const idGov = `${empresa}#202310#IDGOV0000000${i}`;
      filaVirtual.push({
        MessageId: idGov,
        ReceiptHandle: randomUUID(),
        Body: JSON.stringify({ cnpj: empresa, xml: "<efin>...</efin>" })
      });
    }
  }

  sqsMock.on(ReceiveMessageCommand).callsFake((input) => {
    const limitePedidas = input.MaxNumberOfMessages || 1;
    const mensagensParaEntregar = filaVirtual.splice(0, limitePedidas);
    if (mensagensParaEntregar.length === 0) {
      return { $metadata: { httpStatusCode: 200 } };
    }
    return { Messages: mensagensParaEntregar };
  });
})()

