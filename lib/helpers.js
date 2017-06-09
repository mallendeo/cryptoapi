'use strict'

/**
 * Repeat a promise indefinitely and execute
 * the callback after each iteration
 *
 * @param {promise} Promise to exec
 * @returns {function}
 *
 * @param {function} Callback to execute with the promise value
 * @returns {promise} Promise with the first call returned value
 *
 * @example
 * // Get Google's HTML each 10 secods
 * repeat(() => axios('http://google.com'))(res => {
 *   console.log(res.data)
 * }, 10000)
 */
const repeat = promise => async (cb, timeout = 10000) => {
  try {
    const value = await promise()
    cb(value)
    return value
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => repeat(promise)(cb, timeout), timeout)
  }
}

const timeoutPromise = async timeout => {
  if (!timeout) throw Error(`'timeout' param required`)
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const throttle = async (promises, timeout = 4000, cb) =>
  Promise.all(
    promises.map(async (promise, index) => {
      if (index > 0) await timeoutPromise(timeout)
      const value = await promise()
      if (cb) cb(value, index)
      return value
    })
  )

module.exports = {
  repeat,
  timeoutPromise,
  throttle
}
