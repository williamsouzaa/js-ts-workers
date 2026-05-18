import { isRequired } from './utils/environment/isRequired.js'

export const NODE_ENV = process.env.NODE_ENV || 'local'
export const API_URL = process.env.API_URL || 'http://localhost:6000'
export const PORT = process.env.PORT || 6000

export const APPLICATION_NAME = 'MOTOR_DE_ENVIO_FISCAL'

export const REDIS = {
  USER: process.env.DATABASE_REDIS_USER || isRequired('DATABASE_REDIS_USER'),
  PASSWORD: process.env.DATABASE_REDIS_PASSWORD || isRequired('DATABASE_REDIS_PASSWORD'),
  HOST: process.env.DATABASE_REDIS_HOST || isRequired('DATABASE_REDIS_HOST'),
  PORT: parseInt(process.env.DATABASE_REDIS_PORT as string, 10) || isRequired('DATABASE_REDIS_PORT'),
}

export const AWS_SQS = {
  EFINANCEIRA: {
    INPUT: {
      URL: process.env.AWS_SQS_QUEUE_INPUT_URL_EFINANCEIRA as string || isRequired("AWS_SQS_QUEUE_INPUT_URL_EFINANCEIRA"),
      AWS_SQS_MAX_SOCKETS_REQUEST: 500
    },
    OUTPUT: {},
  }
}

export const EFINANCEIRA = {
  CERT_THUMBPRINT : NODE_ENV === 'PROD' ? "33ff3179bda29a7e25daa52631defc19d1105b2d" : "cc242988a739caa7757b29e2a900ae35519cdb39",

  BASE_PATH_LAYOUTS_XSD   : 'app/src/modules/efinanceira/infra/storage/XSDs/layouts' as `app/${string}`,

  BASE_PATH_CERT_GOV : 'app/src/modules/efinanceira/infra/storage/certificates/gov' as `app/${string}`,
  CERT_GOV_FILE_NAME:  NODE_ENV === 'PROD' ? "efinanceira-producao.pem" : "efinanceira-homologacao.pem",

  BASE_PATH_CERT_COMPANYS : 'app/src/modules/efinanceira/infra/storage/certificates/company' as `app/${string}`,

  CERT_PASSWORD: {
    GENERIC_COMPANY: "ABC123456"
  }
}