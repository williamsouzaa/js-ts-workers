import { Worker, isMainThread, parentPort, workerData, setEnvironmentData, getEnvironmentData } from 'worker_threads';
import { EWorkerState } from "../../../interfaces/application/workers/EWorkerState.js"
import { IWorkerThread } from "../../../interfaces/application/workers/IWorkerThread.js"


export class WorkerThread implements IWorkerThread {
  private _id!: number
  private _name!: string
  private _state!: EWorkerState
  private _worker!: Worker
  private _packateLimit: number = 50

  public get name(): string { return this._name }
  public get id(): number { return this._id }
  public get state(): EWorkerState { return this._state }
  public get worker(): Worker { return this._worker }


  public async handle(id: number, name: string, worker: Worker): Promise<void> {
    this._id = id
    this._name = name
    this._state = EWorkerState.IDLE
    this._worker = worker

    this._worker.on('message', async (message: any) => await this.handleSuccessEvent(message));
    this._worker.on('error', async (erro: any) => await this.handleErrorEvent(erro));
    this._worker.on('exit', async (code: any) => await this.handleExitEvent(code));
  }

  public postMessage(structData: object, bufferData: any, ignoreState: boolean = false): void {
    if (this._state !== EWorkerState.IDLE) return

    const uint8ArrayData: Uint8Array<ArrayBuffer> = typeof bufferData === 'string'
    ? new TextEncoder().encode(bufferData)
    : new TextEncoder().encode(JSON.stringify(bufferData))

    this._worker.postMessage({...structData, binaryData: uint8ArrayData }, [uint8ArrayData.buffer])

    this._state = EWorkerState.BUSY
  }

  private async handleSuccessEvent(message: any): Promise<void> {
    this._state = EWorkerState.IDLE
    // dependencia
    console.log("handleSuccessEvent: ", message)
  }

  private async handleErrorEvent(erro: any): Promise<void> {
    this._state = EWorkerState.IDLE
    // dependencia
    console.log("handleErrorEvent: ", erro)
  }

  private async handleExitEvent(code: any): Promise<void> {
    this._state = EWorkerState.OFFLINE
    // dependencia
    console.log("handleExitEvent: ", code)
  }

  public changeStateTo(state: EWorkerState): void { this._state = state }
  public workerIsBusy(): boolean { return this._state === EWorkerState.BUSY }
  public workerIsOffline(): boolean { return this._state === EWorkerState.OFFLINE }
  public workerIsIdle(): boolean { return this._state === EWorkerState.IDLE }
}