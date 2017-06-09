'use strict'

const poloniex = require('./poloniex')
const bittrex = require('./bittrex')
const mindicador = require('./mindicador')
const coindesk = require('./coindesk')
const cryptomkt = require('./cryptomkt')
const surbtc = require('./surbtc')

module.exports = {
  poloniex,
  bittrex,
  mindicador,
  coindesk,
  cryptomkt,
  surbtc
}

// TODO
// Shapeshift
// Kraken
