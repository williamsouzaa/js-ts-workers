export interface IScheduler {
  cron: string

  handle(): Promise<void>
}