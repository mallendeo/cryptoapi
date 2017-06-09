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

const normalizeMarkets = (markets, currencies) =>
  markets.map(market => Object.assign({}, {
    name: market.MarketName.replace('-', '_'),
    exchange: 'bittrex',
    last: market.Last,
    ask: market.Ask,
    bid: market.Bid
  }, (
    () => {
      const {
        MinConfirmation: minConf,
        TxFee: txFee,
        IsActive: active
      } = currencies.find(c =>
        c.Currency === market.MarketName.split('-')[1]
      )
      return { minConf, txFee, active }
    })()
  ))

module.exports = {
  getMarketSummaries,
  getMarkets,
  getCurrencies,
  getTicker,
  normalizeMarkets
}
