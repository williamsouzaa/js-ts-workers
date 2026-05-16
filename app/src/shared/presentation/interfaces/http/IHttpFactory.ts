import { IHttpController } from './IHttpController.js'

export interface IHttpFactory {
  handle(): IHttpController
}
