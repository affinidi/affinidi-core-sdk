import sinon from 'sinon'
import * as chai from 'chai'
import Prometheus from 'prom-client'
import { profile, ProfileAction } from '../../../src'
import { ConsoleReporter } from '../../../src/profiler/ConsoleReporter'
import { DefaultProfilerActivator } from '../../../src/profiler/DefaultProfilerActivator'

class SdkOptions {
  didMethod?: 'jolo' | 'elem'
  isProfilerActive?: boolean
}

const expect = chai.expect

afterEach(() => {
  sinon.restore()
})
describe('ProfilerDecorator', () => {
  it('profiling class with members statistic as same as instance', () => {
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(true)

    @profile()
    class TestTarget {
      public DECISION_THRESHOLD = 37
      static async getStaticSecrete() {
        return Promise.resolve({})
      }

      static getUltimateAnswer() {
        return 42
      }

      decisionPoolSize(poolSize: number = 1) {
        return (this.DECISION_THRESHOLD * poolSize) / 100
      }

      ultimatePoolSize(poolSize: number = 1) {
        return (TestTarget.getUltimateAnswer() * poolSize) / 100
      }
    }

    TestTarget.getUltimateAnswer()
    const target = new TestTarget()
    target.decisionPoolSize(43)
    target.ultimatePoolSize(3)
    TestTarget.getStaticSecrete().then((r) => r)

    expect(reporterSpy.firstCall.args[0]).to.be.eq('getUltimateAnswer')
    expect(reporterSpy.firstCall.args[1]).to.be.eq('TestTarget')

    expect(reporterSpy.secondCall.args[0]).to.be.eq('decisionPoolSize')
    expect(reporterSpy.secondCall.args[1]).to.be.eq('TestTarget')

    expect(reporterSpy.thirdCall.args[0]).to.be.eq('getUltimateAnswer')
    expect(reporterSpy.thirdCall.args[1]).to.be.eq('TestTarget')

    expect(reporterSpy.thirdCall.args[0]).to.be.eq('getUltimateAnswer')
    expect(reporterSpy.thirdCall.args[1]).to.be.eq('TestTarget')
  })
  it('do nothing on ', () => {
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(false)
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    @profile()
    class DoNothing {
      static staticMethod() {
        return 1
      }
      instanceMethod() {
        return 2
      }
    }
    DoNothing.staticMethod()
    const test = new DoNothing()
    test.instanceMethod()
    expect(reporterSpy.called).to.be.false
  })

  it('profiling for method with sdkOptionsScan option', () => {
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    @profile()
    class Ultimate {
      getUltimateAnswer() {
        return 42
      }
      @profile(ProfileAction.sdkOptionsScan)
      static get37(options: SdkOptions) {
        return options.didMethod === 'jolo' ? 37 : 42
      }
    }
    const target = new Ultimate()
    target.getUltimateAnswer()
    expect(reporterSpy.called).to.be.false
    Ultimate.get37({ isProfilerActive: true })
    expect(reporterSpy.called).to.be.true
    target.getUltimateAnswer()

    expect(reporterSpy.firstCall.args[0]).to.be.eq('get37')
    expect(reporterSpy.firstCall.args[1]).to.be.eq('Ultimate')

    expect(reporterSpy.secondCall.args[0]).to.be.eq('getUltimateAnswer')
    expect(reporterSpy.secondCall.args[1]).to.be.eq('Ultimate')
  })

  it('should handle Ignore option', async () => {
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(true)
    @profile()
    class AsyncTest {
      @profile(ProfileAction.ignore)
      static async staticIgnoredMethod(makeError: boolean): Promise<boolean> {
        if (makeError) {
          return Promise.resolve(makeError)
        } else {
          return Promise.reject(makeError)
        }
      }

      static async staticMethod(makeError: boolean): Promise<boolean> {
        if (makeError) {
          return Promise.resolve(makeError)
        } else {
          return Promise.reject(makeError)
        }
      }
    }
    const result = await AsyncTest.staticIgnoredMethod(true)
    expect(result).to.be.true
    expect(reporterSpy.called).to.be.false
    const secondResult = await AsyncTest.staticMethod(true)
    expect(secondResult).to.be.true
    expect(reporterSpy.called).to.be.true
  })

  it('should handle Promises', async () => {
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(true)
    @profile()
    class AsyncTest {
      static async staticMethod(makeError: boolean): Promise<boolean> {
        if (makeError) {
          return Promise.resolve(makeError)
        } else {
          return Promise.reject(makeError)
        }
      }
    }

    const result = await AsyncTest.staticMethod(true)
    expect(result).to.be.true
    AsyncTest.staticMethod(false).catch((a) => expect(a).to.be.false)
    expect(reporterSpy.called).to.be.true
  })

  it('should wait for promise', async () => {
    const reporterSpy = sinon.stub(ConsoleReporter, 'record')
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(true)
    @profile()
    class AsyncTest {
      static async someLongRun(timeOut: number) {
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve(timeOut)
          }, timeOut)
        })
      }
    }

    const timeout = 700
    const schedulingDelta = 300
    await AsyncTest.someLongRun(timeout)
    const delta = reporterSpy.firstCall.args[3] - reporterSpy.firstCall.args[2]
    expect(delta).to.be.within(timeout, timeout + schedulingDelta)
  })

  it('should use recorder from env vars', () => {
    sinon.stub(DefaultProfilerActivator, 'isActive').returns(true)

    process.env.PROFILER_RECORDER = 'prometheus'
    @profile()
    class SomeTest {
      static someMethod() {
        return 'some result'
      }
    }
    delete process.env.PROFILER_RECORDER

    SomeTest.someMethod()

    const metric = <Prometheus.Histogram<string>>(
      Prometheus.register.getSingleMetric('sdk_operations_duration_seconds_bucket')
    )
    expect(metric).to.be.not.undefined
    const usageCount = (metric as any)?.hashMap?.['desc:SomeTest.someMethod']?.count
    expect(usageCount).to.be.eq(1)
  })
})
