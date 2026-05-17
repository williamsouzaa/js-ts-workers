import { fork, ChildProcess } from 'child_process';
import { IWorkerErrorEventHandler } from "../../../interfaces/application/workers/events/IWorkerErrorEventHandler.js"
import { IWorkerExitEventHandler } from "../../../interfaces/application/workers/events/IWorkerExitEventHandler.js"
import { IWorkerSucessEventHandler } from "../../../interfaces/application/workers/events/IWorkerSucessEventHandler.js"
import { IWorker, E_WORKER_STATE } from "../../../interfaces/application/workers/IWorker.js"
import { TPostMessageStrucData } from '../../../interfaces/application/workers/IParentPortWorker.js';

export abstract class AWorker<TEntryData> implements IWorker<TEntryData> {
  private _id!: number
  private _name!: string
  private _state!: E_WORKER_STATE
  private _worker!: ChildProcess
  private _currentLoad: number = 0
  private _limitHealthLoad: number = 200 * 1000

  public get name(): string { return this._name }
  public get id(): number { return this._id }
  public get state(): E_WORKER_STATE { return this._state }
  public get worker(): ChildProcess { return this._worker }
  public get currentLoad(): number { return this._currentLoad }

  constructor(
    private sucessEventHandler: IWorkerSucessEventHandler<TEntryData>,
    private errorEventHandler: IWorkerErrorEventHandler,
    private exitEventHandler: IWorkerExitEventHandler
  ) {}

  public async handle(id: number, name: string, pathWorkerFile: string): Promise<void> {
    this._id = id
    this._name = name
    this._state = E_WORKER_STATE.IDLE

    // fork() spawns a new Node.js process and sets up an IPC channel automatically.
    // WORKER_NAME and WORKER_ID replace workerData from worker_threads.
    this._worker = fork(pathWorkerFile, [], {
      env: { ...process.env, WORKER_NAME: name, WORKER_ID: String(id) }
    })

    this._worker.on('message', async (structData: TPostMessageStrucData<TEntryData>) => await this.handleSuccessEvent(structData))
    this._worker.on('error',   async (erro: any)  => await this.handleErrorEvent(erro))
    this._worker.on('exit',    async (code: any)   => await this.handleExitEvent(code))
  }

  public changeStateTo(state: E_WORKER_STATE): void { this._state = state }
  public workerIsBusy(): boolean    { return this._state === E_WORKER_STATE.BUSY }
  public workerIsOffline(): boolean { return this._state === E_WORKER_STATE.OFFLINE }
  public workerIsIdle(): boolean    { return this._state === E_WORKER_STATE.IDLE }

  public async postMessage(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    if (this._state !== E_WORKER_STATE.IDLE) return

    Array.isArray(bufferData)
      ? await this.handleToPostMessageListToWorker(structData, bufferData)
      : await this.handleToPostMessage(structData, bufferData)

    this.addOneToTheCurrentLoad()
  }

  // child_process IPC serialises via JSON, so ArrayBuffer transfer is not available.
  // We encode each binary chunk as a base64 string; the child decodes it back.
  private async handleToPostMessageListToWorker(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    const binaryDataList: string[] = []
    for (const el of bufferData) {
      const uint8ArrayData: Uint8Array = typeof el === 'string'
        ? new TextEncoder().encode(el)
        : new TextEncoder().encode(JSON.stringify(el))
      binaryDataList.push(Buffer.from(uint8ArrayData).toString('base64'))
    }
    this._worker.send({ ...structData, binaryData: binaryDataList, _encoding: 'base64list' })
  }

  private async handleToPostMessage(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void> {
    const uint8ArrayData: Uint8Array = typeof bufferData === 'string'
      ? new TextEncoder().encode(bufferData)
      : new TextEncoder().encode(JSON.stringify(bufferData))
    this._worker.send({ ...structData, binaryData: Buffer.from(uint8ArrayData).toString('base64'), _encoding: 'base64' })
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
    if (this._currentLoad != 0) this._currentLoad -= 1
    this.handleStateWorker()
  }

  private async handleSuccessEvent(structData: TPostMessageStrucData<TEntryData>): Promise<void> {
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


