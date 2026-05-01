import { IHttpController } from './IHttpController'

export interface IHttpFactory {
  handle(): IHttpController
}