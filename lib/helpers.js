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

/**
 * Promise version of setTimeout
 * @param {number} timeout
 */
const timeoutPromise = async timeout => {
  if (!timeout) throw Error(`'timeout' param required`)
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

/**
 * Execute an array of promises, throttling them
 * one after another.
 * e.g For preventing API rate bans
 *
 * @param {array} promises
 * @param {number} timeout Time between promises
 * @param {function} cb Callback with the promise value and index
 * @returns {promise} All throttled promises
 *
 * @example
 * const values = throttle([
 *  () => Promise.resolve({ msg: 'hi!' }),
 *  () => Promise.resolve({ msg: `I'll be called later...` }),
 *  longPromise,
 *  () => Promise.resolve({ msg: `I'm the last one` })
 * ], 2000, (value, index) => {
 *  console.log(`promise ${index} value is`, value)
 * })
 * console.log('All promises resolved!', values)
 */
const throttle = async (promises, timeout = 1000, cb) =>
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
