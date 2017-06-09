'use strict'

const axios = require('axios')

// TODO: Get quotation/txFee from API
const txFee = 0.007

const ethClp = async () => {
  const { data } = await axios('https://www.cryptomkt.com/api/ethclp/1440.json')
  if (data.status === 'success') {
    const { data: { prices_ask, prices_bid } } = data
    return {
      name: 'ETH_CLP',
      exchange: 'cryptomkt',
      txFee,
      last: Number(prices_ask.values[0].open_price),
      bid: Number(prices_bid.values[0].close_price),
      ask: Number(prices_ask.values[0].close_price)
    }
  }
}

module.exports = {
  ethClp
}
