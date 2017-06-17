'use strict'

const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { isEqual } = require('lodash')

const { repeat, throttle, logError } = require('./helpers')
const { events } = require('./constants')
const api = require('./api')
const state = require('./state')

const { PORT = 3000 } = process.env

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const emit = (event, data, broadcast = false) => {
  const timestamp = Date.now()
  const payload = { data, timestamp }

  if (broadcast) {
    return io.emit(event, payload)
  }

  io.to(event).emit(event, payload)
}

const emitUpdateState = (event, data) => {
  // Change global state!
  const lastState = state.getState()
  if (!isEqual(lastState[event], data)) {
    state.setState({
      [event]: data
    })
    emit(event, data)
  }
}

const repeatLog = func => (cb, timeout = 10000) => {
  return repeat(func)((err, data) => {
    if (err) return logError(err, func)

    if (cb) cb(data)
  }, timeout)
}

// Init server
server.listen(PORT, async () => {
  // Mindicador
  repeatLog(api.mindicador.usdClp)(market => {
    emitUpdateState(events.MINDICADOR_USD_CLP, market)
  })

  // Cryptomkt
  repeatLog(api.cryptomkt.ethClp)(market => {
    emitUpdateState(events.CRYPTOMKT_ETH_CLP, market)
  })

  // SurBTC
  repeatLog(api.surbtc.btcClp)(market => {
    emitUpdateState(events.SURBTC_BTC_CLP, market)
  })

  // Poloniex
  repeatLog(api.poloniex.getTicker)(ticker => {
    emitUpdateState(events.POLONIEX_TICKER, ticker)
  }, 1000)

  repeatLog(api.poloniex.getCurrencies)(currencies => {
    emitUpdateState(events.POLONIEX_CURRENCIES, currencies)
  }, 1500)

  // Bittrex
  // Throttle API calls by one second
  const requests = [
    api.bittrex.getCurrencies,
    api.bittrex.getMarkets,
    api.bittrex.getMarketSummaries
  ]
  const throttled = () =>
    throttle(requests, 3000, (err, value, index) => {
      if (err) return logError(err, requests[index])
      switch (requests[index].name) {
        case 'getCurrencies':
          emitUpdateState(events.BITTREX_CURRENCIES, value)
          break
        case 'getMarkets':
          emitUpdateState(events.BITTREX_MARKETS, value)
          break
        case 'getMarketSummaries':
          emitUpdateState(events.BITTREX_SUMMARIES, value)
          break
      }
    })

  repeatLog(throttled)(undefined, 3000)
})

io.on('connection', socket => {
  console.log('client connected!')

  socket.on(events.SOCKET_INFO, () => {
    socket.emit(events.SOCKET_INFO, { events })
  })

  Object.values(events).forEach(event => {
    if (event.startsWith('api')) return
    socket.on(event, data => {
      const latest = state.getState()[event]
      if (latest) {
        emit(event, latest[event], true)
      }
    })
  })

  socket.on('subscribe', room => {
    const checkRoom = Object.values(events).find(r => r === room)
    if (checkRoom) {
      console.log('joining room', room)
      socket.emit(room, state.getState()[room])
      return socket.join(room)
    }

    socket.emit(events.SOCKET_ERROR, `Couldn't find room '${room}'`)
  })

  socket.on('unsubscribe', room => {
    console.log('leaving room', room)
    socket.leave(room)
  })
})
