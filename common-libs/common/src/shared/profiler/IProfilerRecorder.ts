export interface IProfilerRecorder {
  record: (name: string, className: string, startStamp: number, endStamp: number, marker?: string) => string
}
