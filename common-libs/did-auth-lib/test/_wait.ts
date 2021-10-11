import util from 'util'

const wait = util.promisify(setTimeout)

module.exports = async (ms: number) => {
  const timer = await wait(ms)
  // clearTimeout(timer)

  return timer
}
