import { Worker, isMainThread, parentPort, workerData, setEnvironmentData, getEnvironmentData } from 'worker_threads';
import { EWorkerState } from "../../../interfaces/application/workers/EWorkerState.js"



export type TPostMessageStrucData = {
  identifier: string,
  queue?: {
    identifier: string,
    message: any | TWorkerThreadSucessEventMessageReceived
  }
  worker?: {
    id: number
  }
  binaryData?: Uint8Array<ArrayBuffer>
}

export type TWorkerThreadSucessEventMessageReceived = {
  identifier: "received",
  keyGroup: string,
  packageIndex: number
}



export interface IWorkerThreadSucessEventHandler {
  handle(structData: TPostMessageStrucData): Promise<void>
}

export interface IWorkerThreadErrorEventHandler {
  handle(erro: Error): Promise<void>
}

export interface IWorkerThreadExitEventHandler {
  handle(code: number): Promise<void>
}


export class WorkerThread {
  private _id!: number
  private _name!: string
  private _state!: EWorkerState
  private _worker!: Worker
  private _currentLoad: number = 0
  private _limitHealthLoad: number = 1000 * 50

  public get name(): string { return this._name }
  public get id(): number { return this._id }
  public get state(): EWorkerState { return this._state }
  public get worker(): Worker { return this._worker }
  public get currentLoad(): number { return this._currentLoad }

  constructor(
    private sucessEventHandler: IWorkerThreadSucessEventHandler,
    private errorEventHandler: IWorkerThreadErrorEventHandler,
    private exitEventHandler: IWorkerThreadExitEventHandler
  ) {}

  public async handle(id: number, name: string, pathWorkerFile: string): Promise<void> {
    this._id = id
    this._name = name
    this._state = EWorkerState.IDLE
    this._worker = new Worker(pathWorkerFile, { workerData: { name, workerId: id } });

    this._worker.on('message', async (structData: TPostMessageStrucData) => await this.handleSuccessEvent(structData));
    this._worker.on('error', async (erro: any) => await this.handleErrorEvent(erro));
    this._worker.on('exit', async (code: any) => await this.handleExitEvent(code));
  }

  public changeStateTo(state: EWorkerState): void { this._state = state }
  public workerIsBusy(): boolean { return this._state === EWorkerState.BUSY }
  public workerIsOffline(): boolean { return this._state === EWorkerState.OFFLINE }
  public workerIsIdle(): boolean { return this._state === EWorkerState.IDLE }

  public async postMessage(structData: TPostMessageStrucData, bufferData: any): Promise<void> {
    if (this._state !== EWorkerState.IDLE) return

    const uint8ArrayData: Uint8Array<ArrayBuffer> = typeof bufferData === 'string'
    ? new TextEncoder().encode(bufferData)
    : new TextEncoder().encode(JSON.stringify(bufferData))

    this._worker.postMessage({...structData, binaryData: uint8ArrayData }, [uint8ArrayData.buffer])
    this.addOneToTheCurrentLoad()
  }

  private handleStateWorker(): void {
    if (this._currentLoad > this._limitHealthLoad) {
      this._state = EWorkerState.BUSY
    } else {
      this._state = EWorkerState.IDLE
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

  private async handleSuccessEvent(structData: TPostMessageStrucData, bufferData?: Uint8Array<ArrayBuffer>): Promise<void> {
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