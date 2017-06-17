'use strict'

// Rooms
const ROOM_BITTREX = 'bittrex'
const ROOM_POLONIEX = 'poloniex'
const ROOM_MINDICADOR = 'mindicador'
const ROOM_SURBTC = 'surbtc'
const ROOM_CRYPTOMKT = 'cryptomkt'
// TODO
const ROOM_CRYPTOCOMPARE = 'cryptocompare'

// Cryptomarkets events
const EVENT_MARKETS = 'markets'
const EVENT_CURRENCIES = 'currencies'
const EVENT_TICKER = 'ticker'
const EVENT_SUMMARIES = 'summaries'

// Market events
const EVENT_USD_CLP = 'USD_CLP'
const EVENT_BTC_CLP = 'BTC_CLP'
const EVENT_ETH_CLP = 'ETH_CLP'

const SOCKET_ERROR = 'api:error'
const SOCKET_INFO = 'api:info'

module.exports = {
  events: {
    MINDICADOR_USD_CLP: `${ROOM_MINDICADOR}:${EVENT_USD_CLP}`,
    CRYPTOMKT_ETH_CLP: `${ROOM_CRYPTOMKT}:${EVENT_ETH_CLP}`,
    SURBTC_BTC_CLP: `${ROOM_SURBTC}:${EVENT_BTC_CLP}`,
    POLONIEX_TICKER: `${ROOM_POLONIEX}:${EVENT_TICKER}`,
    POLONIEX_CURRENCIES: `${ROOM_POLONIEX}:${EVENT_CURRENCIES}`,
    BITTREX_MARKETS: `${ROOM_BITTREX}:${EVENT_MARKETS}`,
    BITTREX_CURRENCIES: `${ROOM_BITTREX}:${EVENT_CURRENCIES}`,
    BITTREX_SUMMARIES: `${ROOM_BITTREX}:${EVENT_SUMMARIES}`,
    SOCKET_ERROR,
    SOCKET_INFO
  }
}
