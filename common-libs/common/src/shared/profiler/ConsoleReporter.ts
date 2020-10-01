import { IProfilerRecorder } from './IProfilerRecorder'
export const ConsoleReporter: IProfilerRecorder = {
  record: (name, className, startStamp, endStamp, marker) => {
    console.log({
      name,
      className,
      startStamp,
      endStamp,
      marker: marker || '',
      duration: endStamp - startStamp,
    })
    return marker
  },
}
