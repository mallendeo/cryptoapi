'use strict'

const Promise = require('bluebird')

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
    cb(null, value)
    return value
  } catch (e) {
    cb(e, null)
  } finally {
    setTimeout(() => repeat(promise)(cb, timeout), timeout)
  }
}

/**
 * Promise version of setTimeout
 * @param {number} timeout
 */
const timeoutPromise = async timeout => {
  if (typeof timeout === 'undefined') throw Error(`'timeout' param required`)
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
 * @param {function} cb Callback with the error if any,
 *                      the promise value and index
 * @returns {promise} All throttled promises
 *
 * @example
 * const values = throttle([
 *  () => Promise.resolve({ msg: 'hi!' }),
 *  () => Promise.resolve({ msg: `I'll be called later...` }),
 *  longPromise,
 *  () => Promise.resolve({ msg: `I'm the last one` })
 * ], 2000, (err, value, index) => {
 *  if (err) console.error('Error:', err)
 *  console.log(`promise ${index} value is`, value)
 * })
 * console.log('All promises resolved!', values)
 */
const throttle = async (promises, timeout = 1000, cb) =>
  Promise
    .map(promises, async (promise, index) => {
      if (index > 0) await timeoutPromise(timeout)
      const value = await promise()
      cb(null, value, index)
      return value
    }, { concurrency: 1 })
    .catch(err => cb(err, null))

// TODO: use persistent logging
const logError = (error, func) => {
  console.error('Error:', error.message)
  if (func) console.error('Function:', func.name)
  if (error.response && error.config) {
    console.error('Response:', error.response.statusText)
    console.error('URL:', error.config.url)
  }
  console.error('\n')
}

module.exports = {
  repeat,
  timeoutPromise,
  throttle,
  logError
}
