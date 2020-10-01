import { ReportItem } from './ReportItem'
export interface IProfilerReporter {
  report: () => Record<string, ReportItem>
  reset: () => void
}
