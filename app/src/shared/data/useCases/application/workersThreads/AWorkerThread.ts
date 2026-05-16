import { Worker } from 'worker_threads';
import { IWorkerThreadErrorEventHandler } from "../../../interfaces/application/workers/events/IWorkerThreadErrorEventHandler.js"
import { IWorkerThreadExitEventHandler } from "../../../interfaces/application/workers/events/IWorkerThreadExitEventHandler.js"
import { IWorkerThreadSucessEventHandler } from "../../../interfaces/application/workers/events/IWorkerThreadSucessEventHandler.js"
import { TPostMessageStrucData } from "../../../interfaces/application/workers/IParentPortWorkerThread.js"
import { IWorkerThread, E_WORKER_STATE } from "../../../interfaces/application/workers/IWorkerThread.js"

export abstract class AWorkerThread<TEntryData> implements IWorkerThread<TEntryData> {
  private _id!: number
  private _name!: string
  private _state!: E_WORKER_STATE
  private _worker!: Worker
  private _currentLoad: number = 0
  private _limitHealthLoad: number = 200 * 1000

  public get name(): string { return this._name }
  public get id(): number { return this._id }
  public get state(): E_WORKER_STATE { return this._state }
  public get worker(): Worker { return this._worker }
  public get currentLoad(): number { return this._currentLoad }

  constructor(
    private sucessEventHandler: IWorkerThreadSucessEventHandler<TEntryData>,
    private errorEventHandler: IWorkerThreadErrorEventHandler,
    private exitEventHandler: IWorkerThreadExitEventHandler
  ) {}

  public async handle(id: number, name: string, pathWorkerFile: string): Promise<void> {
    this._id = id
    this._name = name
    this._state = E_WORKER_STATE.IDLE
    this._worker = new Worker(pathWorkerFile, { workerData: { name, workerId: id } });

    this._worker.on('message', async (structData: TPostMessageStrucData<TEntryData>) => await this.handleSuccessEvent(structData));
    this._worker.on('error', async (erro: any) => await this.handleErrorEvent(erro));
    this._worker.on('exit', async (code: any) => await this.handleExitEvent(code));
  }

  public changeStateTo(state: E_WORKER_STATE): void { this._state = state }
  public workerIsBusy(): boolean { return this._state === E_WORKER_STATE.BUSY }
  public workerIsOffline(): boolean { return this._state === E_WORKER_STATE.OFFLINE }
  public workerIsIdle(): boolean { return this._state === E_WORKER_STATE.IDLE }

  public async postMessage(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    console.log("CHECKPOINT >> postMessage", structData, bufferData)

    if (this._state !== E_WORKER_STATE.IDLE) return

    Array.isArray(bufferData)
      ? await this.handleToPostMessageListToWorker(structData, bufferData)
      : await this.handleToPostMessage(structData, bufferData)

    this.addOneToTheCurrentLoad()
  }

  private async handleToPostMessageListToWorker(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    const binaryDataList = []
    for (const el of bufferData) {
      const uint8ArrayData: Uint8Array<ArrayBuffer> = typeof el === 'string'
        ? new TextEncoder().encode(el)
        : new TextEncoder().encode(JSON.stringify(el))
      binaryDataList.push(uint8ArrayData.buffer)
    }
    this._worker.postMessage({...structData, binaryData: binaryDataList }, binaryDataList)
  }

  private async handleToPostMessage(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    const uint8ArrayData: Uint8Array<ArrayBuffer> = typeof bufferData === 'string'
        ? new TextEncoder().encode(bufferData)
        : new TextEncoder().encode(JSON.stringify(bufferData))
      this._worker.postMessage({...structData, binaryData: uint8ArrayData }, [uint8ArrayData.buffer])
  }

  private handleStateWorker(): void {
    if (this._currentLoad > this._limitHealthLoad) {
      this._state = E_WORKER_STATE.BUSY
    } else {
      this._state = E_WORKER_STATE.IDLE
    }
  }

  private addOneToTheCurrentLoad(): void {
    this._currentLoad += 1
    this.handleStateWorker()
  }

  private subtractOneFromTheCurrentLoad(): void {
    this._currentLoad -= 1
    this.handleStateWorker()
  }

  private async handleSuccessEvent(structData: TPostMessageStrucData<TEntryData>, bufferData?: Uint8Array<ArrayBuffer>): Promise<void> {
    this.subtractOneFromTheCurrentLoad()
    await this.sucessEventHandler.handle(structData)
  }

  private async handleErrorEvent(erro: any): Promise<void> {
    this.subtractOneFromTheCurrentLoad()
    await this.errorEventHandler.handle(erro)
  }

  private async handleExitEvent(code: any): Promise<void> {
    this.subtractOneFromTheCurrentLoad()
    await this.exitEventHandler.handle(code)
  }
}


