export interface IProfilerActivator {
  isActive: () => boolean
  setActive: (status: boolean | undefined) => boolean
}
