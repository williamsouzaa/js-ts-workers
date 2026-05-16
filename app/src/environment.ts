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

