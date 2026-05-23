import { fork, ChildProcess } from 'child_process';
import { IWorkerErrorEventHandler } from "../../../interfaces/application/workers/events/IWorkerErrorEventHandler.js"
import { IWorkerExitEventHandler } from "../../../interfaces/application/workers/events/IWorkerExitEventHandler.js"
import { IWorkerSuccessEventHandler } from "../../../interfaces/application/workers/events/IWorkerSuccessEventHandler.js"
import { IWorker } from "../../../interfaces/application/workers/IWorker.js"
import { TWorkerListenerStructData } from '../../../interfaces/application/workers/IWorkerListener.js';

export abstract class AWorker<TEntryData> implements IWorker<TEntryData> {
  public id!: number
  public name!: string
  public worker!: ChildProcess

  constructor(
    private sucessEventHandler: IWorkerSuccessEventHandler<TEntryData>,
    private errorEventHandler: IWorkerErrorEventHandler,
    private exitEventHandler: IWorkerExitEventHandler
  ) {}

  public async handle(id: number, name: string, pathWorkerFile: string): Promise<void> {
    this.id = id
    this.name = name

    this.worker = fork(pathWorkerFile, [], { env: { ...process.env, WORKER_NAME: name, WORKER_ID: String(id) } })

    this.worker.on('message', async (structData: TWorkerListenerStructData<TEntryData>) => await this.handleSuccessEvent(structData))
    this.worker.on('error',   async (erro: any)  => await this.handleErrorEvent(erro))
    this.worker.on('exit',    async (code: any)   => await this.handleExitEvent(code))
  }

  public async postMessage(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void> {
    Array.isArray(bufferData)
      ? await this.handleToPostMessageListToWorker(structData, bufferData)
      : await this.handleToPostMessage(structData, bufferData)
  }

  private async handleToPostMessageListToWorker(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void> {
    const dataList: string[] = bufferData.map((el: any) => typeof el === 'string' ? el : JSON.stringify(el))
    this.worker.send({ ...structData, binaryData: dataList })
  }

  private async handleToPostMessage(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void> {
    const data = typeof bufferData === 'string' ? bufferData : JSON.stringify(bufferData)
    this.worker.send({ ...structData, binaryData: data })
  }

  private async handleSuccessEvent(structData: TWorkerListenerStructData<TEntryData>): Promise<void> {
    await this.sucessEventHandler.handle(structData)
  }

  private async handleErrorEvent(erro: any): Promise<void> {
    await this.errorEventHandler.handle(erro)
  }

  private async handleExitEvent(code: any): Promise<void> {
    await this.exitEventHandler.handle(code)
  }
}


