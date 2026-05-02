import { Worker, isMainThread, parentPort, workerData, setEnvironmentData, getEnvironmentData } from 'worker_threads';
import { EWorkerState } from "../../../interfaces/application/workers/EWorkerState.js"
import { IWorkerThread } from "../../../interfaces/application/workers/IWorkerThread.js"


export class WorkerThread implements IWorkerThread {
  private _id!: number
  private _name!: string
  private _state!: EWorkerState
  private _worker!: Worker

  public get name(): string { return this._name }
  public get id(): number { return this._id }
  public get state(): EWorkerState { return this._state }
  public get worker(): Worker { return this._worker }

  public async handle(id: number, name: string, pathFileWorker: string): Promise<void> {
    this._id = id
    this._name = name
    this._state = EWorkerState.IDLE
    this._worker = new Worker(pathFileWorker, {name, workerData: {workerId: id}})

    this._worker.on('message', async (message) => await this.handleSuccessEvent(message));
    this._worker.on('error', async (erro) => await this.handleErrorEvent(erro));
    this._worker.on('exit', async (code) => await this.handleExitEvent(code));
  }

  public postMessage(structData: object, bufferData: any): void {
    console.log('postMessage', 1 )
    if (this._state !== EWorkerState.IDLE) return
    console.log('postMessage', 2 )
    const uint8ArrayData: Uint8Array<ArrayBuffer> = typeof bufferData === 'string'
    ? new TextEncoder().encode(bufferData)
    : new TextEncoder().encode(JSON.stringify(bufferData))

    console.log('postMessage', 3 )
    console.log('uint8ArrayData 1', uint8ArrayData )

    this._worker.postMessage({...structData, binaryData: uint8ArrayData }, [uint8ArrayData.buffer])
    console.log('uint8ArrayData 2', uint8ArrayData )

    this._state = EWorkerState.BUSY
  }

  private async handleSuccessEvent(message: any): Promise<void> {
    this._state = EWorkerState.IDLE
    // dependencia
    console.log(message)
  }

  private async handleErrorEvent(erro: any): Promise<void> {
    this._state = EWorkerState.IDLE
    // dependencia
    console.log(erro)
  }

  private async handleExitEvent(code: any): Promise<void> {
    this._state = EWorkerState.OFFLINE
    // dependencia
    console.log(code)
  }

  public changeStateTo(state: EWorkerState): void { this._state = state }
  public workerIsBusy(): boolean { return this._state === EWorkerState.BUSY }
  public workerIsOffline(): boolean { return this._state === EWorkerState.OFFLINE }
  public workerIsIdle(): boolean { return this._state === EWorkerState.IDLE }
}