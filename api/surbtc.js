'use strict'

const axios = require('axios')

// TODO: Get quotation/txFee from API
const txFee = 0.01

const btcClp = async () => {
  const { data } = await axios('https://www.surbtc.com/api/v2/markets/btc-clp/ticker')
  if (data) {
    return {
      name: 'BTC_CLP',
      exchange: 'surbtc',
      txFee,
      last: Number(data.ticker.last_price[0]),
      ask: Number(data.ticker.min_ask[0]),
      bid: Number(data.ticker.max_bid[0])
    }
  }
}

module.exports = {
  btcClp
}
