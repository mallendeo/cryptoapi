'use strict'

const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { isEqual } = require('lodash')

const { repeat, throttle, logError } = require('./helpers')
const { channels } = require('./constants')
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
    emitUpdateState(channels.MINDICADOR_USD_CLP, market)
  })

  // Cryptomkt
  repeatLog(api.cryptomkt.ethClp)(market => {
    emitUpdateState(channels.CRYPTOMKT_ETH_CLP, market)
  })

  // SurBTC
  repeatLog(api.surbtc.btcClp)(market => {
    emitUpdateState(channels.SURBTC_BTC_CLP, market)
  })

  // Poloniex
  repeatLog(api.poloniex.getTicker)(ticker => {
    emitUpdateState(channels.POLONIEX_TICKER, ticker)
  }, 1000)

  repeatLog(api.poloniex.getCurrencies)(currencies => {
    emitUpdateState(channels.POLONIEX_CURRENCIES, currencies)
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
          emitUpdateState(channels.BITTREX_CURRENCIES, value)
          break
        case 'getMarkets':
          emitUpdateState(channels.BITTREX_MARKETS, value)
          break
        case 'getMarketSummaries':
          emitUpdateState(channels.BITTREX_SUMMARIES, value)
          break
      }
    })

  repeatLog(throttled)(undefined, 3000)
})

io.on('connection', socket => {
  console.log('client connected!')

  socket.on(channels.SOCKET_INFO, () => {
    socket.emit(channels.SOCKET_INFO, { channels })
  })

  Object.values(channels).forEach(channel => {
    if (channel.startsWith('api')) return
    socket.on(channel, data => {
      const latest = state.getState()[channel]
      if (latest) {
        emit(channel, latest[channel], true)
      }
    })
  })

  socket.on('subscribe', channel => {
    const checkChannel = Object.values(channels).find(c => c === channel)
    if (checkChannel) {
      console.log('ID:', socket.id, 'joining channel', channel)
      socket.emit(channel, {
        data: state.getState()[channel],
        timestamp: Date.now()
      })
      return socket.join(channel)
    }

    socket.emit(channels.SOCKET_ERROR, `Couldn't find channel '${channel}'`)
  })

  socket.on('unsubscribe', channel => {
    console.log('leaving channel', channel)
    socket.leave(channel)
  })
})
