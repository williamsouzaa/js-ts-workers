import { E_OBRIGACOES_CODIGO_LAYOUT } from './core/domain/fiscalObligations/names.js'
import { isRequired } from './utils/environment/isRequired.js'

export const NODE_ENV = process.env.NODE_ENV || 'local'
export const API_URL = process.env.API_URL || 'http://localhost:6000'
export const PORT = process.env.PORT || 6000
export const APPLICATION_NAME = 'MOTOR_DE_ENVIO_FISCAL'


// ============================================================================

export const REDIS = {
  USER: process.env.DATABASE_REDIS_USER || isRequired('DATABASE_REDIS_USER'),
  PASSWORD: process.env.DATABASE_REDIS_PASSWORD || isRequired('DATABASE_REDIS_PASSWORD'),
  HOST: process.env.DATABASE_REDIS_HOST || isRequired('DATABASE_REDIS_HOST'),
  PORT: parseInt(process.env.DATABASE_REDIS_PORT as string, 10) || isRequired('DATABASE_REDIS_PORT'),
}


// ============================================================================

export const AWS_SQS = {
  EFINANCEIRA: {
    INPUT: {
      URL: process.env.AWS_SQS_QUEUE_INPUT_URL_EFINANCEIRA as string || isRequired("AWS_SQS_QUEUE_INPUT_URL_EFINANCEIRA"),
      AWS_SQS_MAX_SOCKETS_REQUEST: 500
    },
    OUTPUT: {},
  },
}


// ============================================================================

export const CERT = {
  EFINANCEIRA: {
    GOV: {
      CERT_FILE_NAME  :  NODE_ENV === 'PROD' ? "efinanceira-producao.pem" : "efinanceira-homologacao.pem",
      CERT_BASE_PATH  : 'app/src/modules/efinanceira/infra/storage/certificates/gov' as `app/${string}`,
      CERT_THUMBPRINT : NODE_ENV === 'PROD' ? "33ff3179bda29a7e25daa52631defc19d1105b2d" : "cc242988a739caa7757b29e2a900ae35519cdb39"
    },
     GENERIC_COMPANY: {
      CERT_BASE_PATH  : 'app/src/modules/efinanceira/infra/storage/certificates/company' as `app/${string}`,
      CERT_PASSWORD   : "ABC123456"
    }
  }
}

// ============================================================================

export const LAYOUTS_XSD = {
  EFINANCEIRA: { BASE_PATH: 'app/src/modules/efinanceira/infra/storage/XSDs/layouts' as `app/${string}` }
}

// ============================================================================




export const EFINANCEIRA = {
  LAYOUT_MAX_PACKAGE_SIZE: {
    '001': 1,
    '002': 1,
    '003': 50,
    '004': 50,
    '005': 1,
    '006': 1,
    '008': 1,
    '009': 1,
    '012': 1,
    '013': 1,
    '014': 1,
  } as Record<E_OBRIGACOES_CODIGO_LAYOUT, number>
}

// ============================================================================
