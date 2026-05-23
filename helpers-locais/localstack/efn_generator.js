/**
 * Gerador de registros fake para evtMovOpFin (e-Financeira)
 * XSD: http://www.eFinanceira.gov.br/schemas/evtMovOpFin/v1_3_0
 *
 * Instalação: npm install @faker-js/faker
 */

// const { faker } = require('@faker-js/faker/locale/pt_BR');

// const { fakerPT_BR } = require('@faker-js/faker')
import { fakerPT_BR } from '@faker-js/faker'

const faker = fakerPT_BR

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Valor monetário no padrão do XSD: [0-9]{1,19}[,][0-9]{2} */
function valorMonetario(min = 100, max = 999999) {
  const v = faker.number.float({ min, max, fractionDigits: 2 });
  return v.toFixed(2).replace('.', ',');
}

/** Valor monetário que pode ser negativo (vlrUltDia): [-]{0,1}[0-9]{1,19}[,][0-9]{2} */
function valorMonetarioOpcionalNegativo(min = -99999, max = 999999) {
  const v = faker.number.float({ min, max, fractionDigits: 2 });
  return v.toFixed(2).replace('.', ',');
}

/** Data no formato AAAA-MM-DD */
function dataXSD(from = new Date('2000-01-01'), to = new Date()) {
  return faker.date.between({ from, to }).toISOString().split('T')[0];
}

/** anoMesCaixa: AAAAMM — padrão 20[0-9]{2}(0[1-9]|1[0-2]) */
function anoMesCaixa() {
  const ano = faker.number.int({ min: 2020, max: 2024 });
  const mes = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
  return `${ano}${mes}`;
}

/** id do evento: 13–20 caracteres, xs:ID (deve começar com letra ou _) */
function idEvento() {
  const seq = faker.number.int({ min: 1, max: 999999999 });
  return `ID${String(seq).padStart(13, '0')}`;
}

/** CNPJ apenas dígitos, 14 chars */
function cnpj14() {
  return faker.string.numeric(14);
}

/** CPF apenas dígitos, 11 chars */
function cpf11() {
  return faker.string.numeric(11);
}

/** Número de conta: até 50 chars */
function numConta() {
  const agencia = faker.string.numeric(4);
  const conta   = faker.string.numeric(8);
  return `${agencia}-${conta}`;
}

/** nrRecibo (usado em retificações): [0-9]{1,18}-[0-9]{2}-[0-9]{3}-[0-9]{4}-[0-9]{1,18} */
function nrRecibo() {
  return [
    faker.string.numeric({ length: { min: 1, max: 18 } }),
    faker.string.numeric(2),
    faker.string.numeric(3),
    faker.string.numeric(4),
    faker.string.numeric({ length: { min: 1, max: 18 } }),
  ].join('-');
}

/** Número de processo judicial: [0-9]{1,21} */
function numProcJud() {
  return faker.string.numeric({ length: { min: 10, max: 20 } });
}

/** Vara / SecJud: unsignedInt com totalDigits=2 (1–99) */
function vara() {
  return faker.number.int({ min: 1, max: 99 });
}

// ---------------------------------------------------------------------------
// Sub-geradores
// ---------------------------------------------------------------------------

function gerarEnderecoEstrutura() {
  return {
    Logradouro:  faker.location.street().substring(0, 60),
    Numero:      String(faker.number.int({ min: 1, max: 9999 })),
    Complemento: faker.helpers.arrayElement(['Ap01', 'Sala5', 'Bloco B']),
    Bairro:      faker.location.county().substring(0, 40),
    CEP:         faker.location.zipCode('########'),
    Municipio:   faker.location.city().substring(0, 60),
    UF:          faker.location.state({ abbreviated: true }),
  };
}

function gerarEndereco() {
  return {
    tpEndereco:        faker.helpers.arrayElement(['RESID', 'COMERC']),
    EnderecoEstrutura: gerarEnderecoEstrutura(),
    Pais:              'BR',
  };
}

function gerarNIF() {
  return {
    NumeroNIF:      faker.string.alphanumeric({ length: { min: 5, max: 20 } }),
    PaisEmissaoNIF: faker.helpers.arrayElement(['US', 'DE', 'FR', 'GB']),
    tpNIF:          faker.helpers.arrayElement(['TIN', 'SSN', 'EIN']),
  };
}

function gerarMedJudic() {
  return {
    NumProcJud:  numProcJud(),
    Vara:        vara(),
    SecJud:      vara(),
    SubSecJud:   faker.location.city().substring(0, 40),
    dtConcessao: dataXSD(new Date('2015-01-01'), new Date('2022-12-31')),
  };
}

function gerarPgtosAcum() {
  const tipos = faker.helpers.arrayElements(
    ['PIX', 'TED', 'DOC', 'BOLETO', 'DEBITO', 'CREDITO'],
    { min: 1, max: 3 }
  );
  return tipos.map((tp) => ({
    tpPgto:       [tp],
    totPgtosAcum: valorMonetario(1000, 500000),
  }));
}

function gerarInfoConta() {
  const usaMedJudic = faker.datatype.boolean({ probability: 0.2 });
  const usaFundo    = faker.datatype.boolean({ probability: 0.15 });

  return {
    ...(usaMedJudic && { MedJudic: [gerarMedJudic()] }),
    infoConta: {
      Reportavel: [
        { Pais: 'BR' },
        ...(faker.datatype.boolean({ probability: 0.4 }) ? [{ Pais: 'US' }] : []),
      ],
      tpConta:             faker.helpers.arrayElement(['D', 'C', 'I']),
      subTpConta:          faker.helpers.arrayElement(['CC', 'CP', 'CI']),
      tpNumConta:          faker.helpers.arrayElement(['IBAN', 'CONTA', 'AGENCIA']),
      numConta:            numConta(),
      dtAberturaConta:     dataXSD(new Date('2000-01-01'), new Date('2023-12-31')),
      formaAberturaConta:  faker.helpers.arrayElement([1, 2]),
      tpRelacaoDeclarado:  faker.number.int({ min: 1, max: 5 }),
      moeda:               faker.helpers.arrayElement(['BRL', 'USD', 'EUR']),
      NoTitulares:         String(faker.number.int({ min: 1, max: 10 })),
      ...(usaFundo && {
        Fundo: {
          CNPJ: cnpj14(),
        },
      }),
      BalancoConta: {
        totCreditos:                   valorMonetario(1000, 999999),
        totDebitos:                    valorMonetario(500,  500000),
        totCreditosMesmaTitularidade:  valorMonetario(0,    200000),
        totDebitosMesmaTitularidade:   valorMonetario(0,    100000),
        vlrUltDia:                     valorMonetarioOpcionalNegativo(-10000, 500000),
      },
      PgtosAcum: gerarPgtosAcum(),
    },
  };
}

function gerarProprietario() {
  return {
    tpNI:                  faker.helpers.arrayElement([1, 3, 5]),
    NIProprietario:        cpf11(),
    tpProprietario:        'PF',
    inDeclaracaoPropriaCRS: faker.helpers.arrayElement(['CRS1001', 'CRS1002']),
    Nome:                  faker.person.fullName().substring(0, 100),
    Endereco: [gerarEndereco()],
    Reportavel: [{ Pais: 'BR' }],
  };
}

// ---------------------------------------------------------------------------
// Gerador principal
// ---------------------------------------------------------------------------

/**
 * Gera um registro fake completo de evtMovOpFin.
 *
 * @param {object} opcoes
 * @param {boolean} [opcoes.comRetificacao=false]   - inclui nrRecibo e indRetificacao=2
 * @param {boolean} [opcoes.comCambio=false]        - inclui bloco Cambio
 * @param {boolean} [opcoes.comProprietarios=false] - inclui Proprietarios no ideDeclarado
 * @param {number}  [opcoes.qtdContas=1]            - quantidade de Contas em movOpFin
 * @returns {object}
 */
export function gerarEvtMovOpFin(opcoes = {}) {
  const {
    comRetificacao    = false,
    comCambio         = false,
    comProprietarios  = false,
    qtdContas         = 1,
  } = opcoes;

  const indRetificacao = comRetificacao
    ? faker.helpers.arrayElement([2, 3])
    : 1;

  return {
    eFinanceira: {
      // "@xmlns": "http://www.eFinanceira.gov.br/schemas/evtMovOpFin/v1_3_0",
      evtMovOpFin: {
        // atributo XML "id" (como representá-lo depende da sua lib de conversão)
        // "@id": idEvento(),


        // ── ideEvento ────────────────────────────────────────────────────────
        ideEvento: {
          indRetificacao,
          ...(comRetificacao && { nrRecibo: nrRecibo() }),
          tpAmb:    2,           // 1=produção | 2=homologação
          aplicEmi: 1,
          verAplic: '1.3.0',
        },

        // ── ideDeclarante ────────────────────────────────────────────────────
        ideDeclarante: {
          cnpjDeclarante: cnpj14(),
        },

        // ── ideDeclarado ─────────────────────────────────────────────────────
        ideDeclarado: {
          tpNI:       1,           // 1=CPF
          tpDeclarado: faker.helpers.arrayElements(
            ['FATCA', 'CRS', 'STTR'],
            { min: 1, max: 2 }
          ),
          NIDeclarado: cpf11(),
          NIF: faker.datatype.boolean({ probability: 0.5 })
            ? [gerarNIF()]
            : [],
          inDeclaracaoPropriaCRS: faker.helpers.arrayElement(['CRS901', 'CRS902']),
          NomeDeclarado:          faker.person.fullName().substring(0, 100),
          DataNasc:               dataXSD(new Date('1950-01-01'), new Date('2000-12-31')),
          InfoNascimento: {
            Municipio: faker.location.city().substring(0, 60),
            PaisNasc:  { Pais: 'BR' },
          },
          Endereco: [gerarEndereco()],
          paisResid: [{ Pais: 'BR' }],
          PaisNacionalidade: [{ Pais: 'BR' }],
          ...(comProprietarios && {
            Proprietarios: [gerarProprietario()],
          }),
        },

        // ── mesCaixa ─────────────────────────────────────────────────────────
        mesCaixa: {
          anoMesCaixa: anoMesCaixa(),
          movOpFin: {
            Conta: Array.from({ length: qtdContas }, () => gerarInfoConta()),
            ...(comCambio && {
              Cambio: {
                totCompras:       valorMonetario(1000, 200000),
                totVendas:        valorMonetario(500,  150000),
                totTransferencias: valorMonetario(200,  100000),
              },
            }),
          },
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Exemplos de uso
// ---------------------------------------------------------------------------

// Registro simples (original, sem câmbio)
const registroSimples = gerarEvtMovOpFin();

// Registro com retificação + câmbio + 2 contas
const registroCompleto = gerarEvtMovOpFin({
  comRetificacao:   true,
  comCambio:        true,
  comProprietarios: true,
  qtdContas:        2,
});

// Gerar múltiplos registros
function gerarLote(quantidade = 10, opcoes = {}) {
  return Array.from({ length: quantidade }, () => gerarEvtMovOpFin(opcoes));
}

// ---------------------------------------------------------------------------
// Exporta e exibe exemplo no console
// ---------------------------------------------------------------------------

