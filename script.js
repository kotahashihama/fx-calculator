const pairs = [
  {
    name: 'EURUSD',
    rate: 0,
    rateExpected: 0
  },
  {
    name: 'USDJPY',
    rate: 0,
    rateExpected: 0
  },
  {
    name: 'GBPUSD',
    rate: 0,
    rateExpected: 0
  },
  {
    name: 'AUDUSD',
    rate: 0,
    rateExpected: 0
  }
]

const positionForm = {
  pair: pairs[0].name,
  action: 'buy',
  lot: 0.01,
  entryRate: 0
}

const app = new Vue({
  el: '#app',
  data: {
    balance: 0,
    broker: 'overseas',
    leverage: {
      overseas: 1000,
      japan: 25
    },

    tradingUnits: {
      overseas: 100000,
      japan: 10000
    },
    leverages: {
      overseas: [1000, 888, 500, 200],
      japan: [25, 20, 10, 5]
    },

    positions: [],
    positionForm,

    pairs,
    pairsFromAPI: null
  },
  computed: {
    unrealizedValue: function () {
      let unrealizedValue = 0

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1]
        const pair = this.positions[i].pair
        const pairInfo = this.pairs.find(function (pairInfo) {
          return (pairInfo.name === pair)
        })

        if (pairInfo.name === USDJPY.name) {
          // ドル円の処理
          if (this.positions[i].action === 'buy') {
            unrealizedValue += (pairInfo.rateExpected - this.positions[i].entryRate) * this.tradingUnits[this.broker] * this.positions[i].lot
          } else {
            unrealizedValue += -(pairInfo.rateExpected - this.positions[i].entryRate) * this.tradingUnits[this.broker] * this.positions[i].lot
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === 'buy') {
            unrealizedValue += (pairInfo.rateExpected - this.positions[i].entryRate) * this.tradingUnits[this.broker] * this.positions[i].lot * USDJPY.rate
          } else {
            unrealizedValue += -(pairInfo.rateExpected - this.positions[i].entryRate) * this.tradingUnits[this.broker] * this.positions[i].lot * USDJPY.rate
          }
        }
      }

      return Math.round(unrealizedValue)
    },
    pips: function () {
      let pips = 0

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1]
        const pair = this.positions[i].pair
        const pairInfo = this.pairs.find(function (pairInfo) {
          return (pairInfo.name === pair)
        })

        if (pairInfo.name === USDJPY.name) {
          // ドル円の処理
          if (this.positions[i].action === 'buy') {
            pips += (pairInfo.rateExpected - this.positions[i].entryRate) * 100
          } else {
            pips += -(pairInfo.rateExpected - this.positions[i].entryRate) * 100
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === 'buy') {
            pips += (pairInfo.rateExpected - this.positions[i].entryRate) * 10000
          } else {
            pips += -(pairInfo.rateExpected - this.positions[i].entryRate) * 10000
          }
        }
      }

      return Math.round(pips * 10) / 10
    },
    equity: function () {
      return Number(this.balance) + this.unrealizedValue
    },
    necessaryMargin: function () {
      let necessaryMargin = 0

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1]
        const pair = this.positions[i].pair
        const pairInfo = this.pairs.find(function (pairInfo) {
          return (pairInfo.name === pair)
        })

        if (pairInfo.name === 'USDJPY') {
          // ドル円の処理
          necessaryMargin += USDJPY.rate * this.tradingUnits[this.broker] * this.positions[i].lot / this.leverage[this.broker]
        } else {
          // それ以外の通貨ペアの処理
          necessaryMargin += pairInfo.rate * USDJPY.rate * this.tradingUnits[this.broker] * this.positions[i].lot / this.leverage[this.broker]
        }
      }
      // 必要証拠金 = 為替レート × Lot数 ÷ レバレッジ比率

      return Math.round(necessaryMargin)
    },
    marginLevel: function () {
      if (this.positions.length) {
        return Math.round(this.equity / this.necessaryMargin * 10000) / 100
      } else {
        return 0
      }
    }
  },
  methods: {
    setEntryRate: function () {
      const pair = this.positionForm.pair
      const pairInfo = this.pairs.find(function (pairInfo) {
        return (currency.name === pair)
      })

      this.positionForm.entryRate = pairInfo.rate
    },
    addPosition: function () {
      this.positions.push({
        pair: this.positionForm.pair,
        action: this.positionForm.action,
        lot: this.positionForm.lot,
        entryRate: this.positionForm.entryRate
      })
    },
    deletePosition: function (index) {
      if (confirm('削除してもよろしいですか？')) {
        this.positions.splice(index, 1)
      }
    },
    getCurrentRates: function () {
      for (let i = 0; i < this.pairs.length; i++) {
        const pair = this.pairs[i].name
        const keyCurrency = this.pairs[i].name.slice(0, 3)

        if (pair === 'USDJPY') {
          this.pairs[i].rate = Math.round(this.pairsFromAPI.JPY * 1000) / 1000
          this.pairs[i].rateExpected = Math.round(this.pairsFromAPI.JPY * 1000) / 1000
        } else {
          this.pairs[i].rate = Math.round(1 / this.pairsFromAPI[keyCurrency] * 100000) / 100000
          this.pairs[i].rateExpected = Math.round(1 / this.pairsFromAPI[keyCurrency] * 100000) / 100000
        }
      }
    },
    setCurrentRate: function (index) {
      const pair = this.pairs[index].name
      const keyCurrency = this.pairs[index].name.slice(0, 3)

      if (pair === 'USDJPY') {
        this.pairs[index].rate = Math.round(this.pairsFromAPI.JPY * 1000) / 1000
      } else {
        this.pairs[index].rate = Math.round(1 / this.pairsFromAPI[keyCurrency] * 100000) / 100000
      }
    },
    setCurrentRateExpected: function (index) {
      const pair = this.pairs[index].name
      const keyCurrency = this.pairs[index].name.slice(0, 3)

      if (pair === 'USDJPY') {
        this.pairs[index].rateExpected = Math.round(this.pairsFromAPI.JPY * 1000) / 1000
      } else {
        this.pairs[index].rateExpected = Math.round(1 / this.pairsFromAPI[keyCurrency] * 100000) / 100000
      }
    }
  },
  filters: {
    withDelimiter: function (value) {
      return value.toLocaleString()
    }
  },
  mounted: function () {
    axios.get('https://api.ratesapi.io/api/latest?base=USD')
      .then(function (response) {
        app.pairsFromAPI = response.data.rates
        app.getCurrentRates()
        app.positionForm.entryRate = Math.round(1 / app.pairsFromAPI['EUR'] * 100000) / 100000
      })
  }
})

window.app = app