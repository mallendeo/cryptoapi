'use strict'

const axios = require('axios')

const endpoint = 'https://poloniex.com'
const getJson = async url => {
  const { data } = await axios(url)
  if (data.error) throw Error(data.error)
  return data
}

const getTicker = async () => {
  const markets = await getJson(`${endpoint}/public?command=returnTicker`)
  const parsed = Object.keys(markets).map(market => {
    const props = Object.keys(markets[market])
      .reduce((prev, curr) => {
        prev[curr] = Number(markets[market][curr])
        return prev
      }, {})

    return Object.assign({}, { market }, props)
  })
  return parsed
}

const getCurrencies = async () => {
  const currencies = await getJson(`${endpoint}/public?command=returnCurrencies`)
  const parsed = Object.keys(currencies).map(currency => {
    const props = Object.keys(currencies[currency])
      .reduce((prev, curr) => {
        const value = currencies[currency][curr]
        prev[curr] = value

        if (curr !== 'name') {
          prev[curr] = Number(value)
        }

        return prev
      }, {})

    return Object.assign({}, { currency }, props)
  })

  return parsed
}

const normalizeMarkets = (markets, currencies) =>
  markets.map(market =>
    Object.assign({}, {
      name: market.market,
      exchange: 'poloniex',
      last: market.last,
      ask: market.lowestAsk,
      bid: market.highestBid
    }, (() => {
      const { minConf, txFee, disabled } = currencies
        .find(c => c.currency === market.market.split('_')[1])
      return { minConf, txFee, active: !disabled }
    })())
  )

module.exports = {
  getTicker,
  getCurrencies,
  normalizeMarkets
}
