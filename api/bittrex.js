'use strict'

const axios = require('axios')

const version = 'v1.1'
const endpoint = `https://bittrex.com/api/${version}`

const getJson = async url => {
  const { data } = await axios(url)
  if (data.success && data.result) {
    return data.result
  }
  throw Error(data.message)
}

const getMarketSummaries = async () => getJson(`${endpoint}/public/getmarketsummaries`)
const getMarkets = async () => getJson(`${endpoint}/public/getmarkets`)
const getCurrencies = async () => getJson(`${endpoint}/public/getcurrencies`)
const getTicker = async () => getJson(`${endpoint}/public/getticker`)

module.exports = {
  getMarketSummaries,
  getMarkets,
  getCurrencies,
  getTicker
}
