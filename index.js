'use strict'

const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const { repeat } = require('./lib/helpers')
const { clpMarkets, differences } = require('./lib/market')
const {
  EVENT_CLP_MARKETS,
  EVENT_CRYPTO_MARKETS
} = require('./constants')

const { PORT = 3000 } = process.env

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const state = {
  clpMarkets: [],
  markets: []
}

// Init server
server.listen(PORT, async () => {
  repeat(clpMarkets)(markets => {
    state.clpMarkets = markets
    io.emit(EVENT_CLP_MARKETS, state.markets)
  }, 30000)

  repeat(differences)(markets => {
    state.markets = markets
    io.emit(EVENT_CRYPTO_MARKETS, state.markets)
  }, 2000)
})

io.on('connection', () => {
  console.log('client connected!')
  io.emit(EVENT_CLP_MARKETS, state.indicators)
  io.emit(EVENT_CRYPTO_MARKETS, state.markets)
})
