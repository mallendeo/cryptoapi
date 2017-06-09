'use strict'

const omit = require('lodash/omit')
const api = require('../api')
const { throttle } = require('./helpers')
const { poloniex, bittrex } = api

const clpMarkets = async () => Promise.all([
  api.mindicador.usdClp(),
  api.surbtc.btcClp(),
  api.cryptomkt.ethClp()
])

const joinMarkets = (exchangeA, exchangeB) =>
  exchangeA.reduce((prev, curr) => {
    const found = exchangeB.find(b => b.name === curr.name)
    if (found) {
      prev.push({
        name: curr.name,
        exchange: {
          [curr.exchange]: omit(curr, ['exchange', 'name']),
          [found.exchange]: omit(found, ['exchange', 'name'])
        }
      })
    }
    return prev
  }, [])

const differences = async () => {
  const polo = throttle([
    poloniex.getTicker,
    poloniex.getCurrencies
  ])

  const btx = throttle([
    bittrex.getMarketSummaries,
    bittrex.getCurrencies
  ])

  const [poloTicker, poloCurr] = await polo
  const [btxSummaries, btxCurr] = await btx

  const btxMarkets = bittrex.normalizeMarkets(btxSummaries, btxCurr)
  const poloMarkets = poloniex.normalizeMarkets(poloTicker, poloCurr)

  return joinMarkets(poloMarkets, btxMarkets)
    .map(market => {
      const { ask: poloAsk } = market.exchange.poloniex
      const { ask: btxAsk } = market.exchange.bittrex
      const max = Math.max(poloAsk, btxAsk)
      const diff = Math.abs(poloAsk - btxAsk)
      const margin = (100 * diff) / max

      return Object.assign({}, market, {
        diff,
        margin
      })
    })
}

module.exports = {
  differences,
  clpMarkets
}
