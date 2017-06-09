'use strict'

const axios = require('axios')

const btcUsd = async () => {
  const { data } = await axios('http://api.coindesk.com/v1/bpi/currentprice.json')
  if (data.bpi) {
    return {
      name: 'BTC_USD',
      exchange: 'coindesk',
      last: data.bpi.USD.rate_float
    }
  }
}

module.exports = {
  btcUsd
}
