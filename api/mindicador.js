'use strict'

const axios = require('axios')

const usdClp = async () => {
  const { data } = await axios('http://mindicador.cl/api/dolar')
  const last = data.serie[0].valor
  return {
    name: 'USD_CLP',
    last
  }
}

module.exports = {
  usdClp
}
