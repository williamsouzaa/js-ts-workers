import { fork, ChildProcess } from 'child_process';
import { IWorkerErrorEventHandler } from "../../../interfaces/application/workers/events/IWorkerErrorEventHandler.js"
import { IWorkerExitEventHandler } from "../../../interfaces/application/workers/events/IWorkerExitEventHandler.js"
import { IWorkerSucessEventHandler } from "../../../interfaces/application/workers/events/IWorkerSucessEventHandler.js"
import { IWorker } from "../../../interfaces/application/workers/IWorker.js"
import { TWorkerListenerStructData } from '../../../interfaces/application/workers/IWorkerListener.js';

export abstract class AWorker<TEntryData> implements IWorker<TEntryData> {
  public id!: number
  public name!: string
  public worker!: ChildProcess

  constructor(
    private sucessEventHandler: IWorkerSucessEventHandler<TEntryData>,
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
    const binaryDataList: string[] = []
    for (const el of bufferData) {
      const uint8ArrayData: Uint8Array = typeof el === 'string'
        ? new TextEncoder().encode(el)
        : new TextEncoder().encode(JSON.stringify(el))
      binaryDataList.push(Buffer.from(uint8ArrayData).toString('base64'))
    }
    this.worker.send({ ...structData, binaryData: binaryDataList, _encoding: 'base64list' })
  }

  private async handleToPostMessage(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void> {
    const uint8ArrayData: Uint8Array = typeof bufferData === 'string'
      ? new TextEncoder().encode(bufferData)
      : new TextEncoder().encode(JSON.stringify(bufferData))
    this.worker.send({ ...structData, binaryData: Buffer.from(uint8ArrayData).toString('base64'), _encoding: 'base64' })
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


