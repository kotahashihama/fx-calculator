const currencyInfo = [
  {
    name: 'EURUSD',
    rate: 0,
    rateExpected: 0
  },
  {
    name: 'USDJPY',
    rate: 110.148,
    rateExpected: 110.148
  },
  {
    name: 'GBPUSD',
    rate: 1.30377,
    rateExpected: 1.30377
  },
  {
    name: 'AUDUSD',
    rate: 0.70186,
    rateExpected: 0.70186
  }
]

const form = {
  pair: currencyInfo[0].name,
  action: 'buy',
  lot: 0.01,
  entryRate: currencyInfo[0].rate
}

const app = new Vue({
  el: '#app',
  data: {
    broker: 'overseas',
    leverage: {
      overseas: 1000,
      japan: 25
    },
    balance: 0,
    standardSizes: {
      overseas: 100000,
      japan: 10000
    },
    leverages: {
      overseas: [1000, 888, 500, 200],
      japan: [25, 20, 10, 5]
    },

    positions: [],
    items: null,

    currencyInfo,
    form
  },
  computed: {
    unrealizedValue: function () {
      let totalUnrealizedValue = 0

      for (let i = 0; i < this.positions.length; i++) {
        const pair = this.positions[i].pair
        const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
          return (currencyInfoItem.name === pair)
        })
        const usdJpyInfo = this.currencyInfo[1]

        if (currencyInfo.name === 'USDJPY') {
          // ドル円の処理
          if (this.positions[i].action === 'buy') {
            totalUnrealizedValue += (currencyInfo.rateExpected - this.positions[i].entryRate) * this.standardSizes[this.broker] * this.positions[i].lot
          } else {
            totalUnrealizedValue += -(currencyInfo.rateExpected - this.positions[i].entryRate) * this.standardSizes[this.broker] * this.positions[i].lot
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === 'buy') {
            totalUnrealizedValue += (currencyInfo.rateExpected - this.positions[i].entryRate) * this.standardSizes[this.broker] * this.positions[i].lot * usdJpyInfo.rate
          } else {
            totalUnrealizedValue += -(currencyInfo.rateExpected - this.positions[i].entryRate) * this.standardSizes[this.broker] * this.positions[i].lot * usdJpyInfo.rate
          }
        }
      }

      return Math.round(totalUnrealizedValue)
    },
    pips: function () {
      let totalPips = 0

      for (let i = 0; i < this.positions.length; i++) {
        const pair = this.positions[i].pair
        const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
          return (currencyInfoItem.name === pair)
        })
        const usdJpyInfo = this.currencyInfo[1]

        if (currencyInfo.name === 'USDJPY') {
          // ドル円の処理
          if (this.positions[i].action === 'buy') {
            totalPips += (currencyInfo.rateExpected - this.positions[i].entryRate) * 100
          } else {
            totalPips += -(currencyInfo.rateExpected - this.positions[i].entryRate) * 100
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === 'buy') {
            totalPips += (currencyInfo.rateExpected - this.positions[i].entryRate) * 10000
          } else {
            totalPips += -(currencyInfo.rateExpected - this.positions[i].entryRate) * 10000
          }
        }
      }

      return Math.round(totalPips * 10) / 10
    },
    necessaryMargin: function () {
      let totalNecessaryMargin = 0

      for (let i = 0; i < this.positions.length; i++) {
        const pair = this.positions[i].pair
        const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
          return (currencyInfoItem.name === pair)
        })
        const usdJpyInfo = this.currencyInfo[1]

        if (currencyInfo.name === 'USDJPY') {
          // ドル円の処理
          totalNecessaryMargin += usdJpyInfo.rate * this.standardSizes[this.broker] * this.positions[i].lot / this.leverage[this.broker]
        } else {
          // それ以外の通貨ペアの処理
          totalNecessaryMargin += currencyInfo.rate * usdJpyInfo.rate * this.standardSizes[this.broker] * this.positions[i].lot / this.leverage[this.broker]
        }
      }
      // 必要証拠金 = 為替レート × Lot数 ÷ レバレッジ比率

      return Math.round(totalNecessaryMargin)
    },
    marginLevel: function () {
      if (this.positions.length) {
        return Math.round(this.balance / this.necessaryMargin * 10000) / 100
      } else {
        return 0
      }
    }
  },
  methods: {
    setEntryRate: function () {
      const pair = this.form.pair
      const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
        return (currencyInfoItem.name === pair)
      })

      this.form.entryRate = currencyInfo.rate
    },
    addPosition: function () {
      this.positions.push({
        pair: this.form.pair,
        action: this.form.action,
        lot: this.form.lot,
        entryRate: this.form.entryRate
      })
    },
    deletePosition: function (index) {
      this.positions.splice(index, 1)
    },
    getCurrentRates: function () {
      for (let i = 0; i < this.currencyInfo.length; i++) {
        const pair = this.currencyInfo[i].name
        const aaa = this.currencyInfo[i].name.slice(0, 3)

        if (pair === 'USDJPY') {
          this.currencyInfo[i].rate = Math.round(this.items.JPY * 1000) / 1000
          this.currencyInfo[i].rateExpected = Math.round(this.items.JPY * 1000) / 1000
        } else {
          this.currencyInfo[i].rate = Math.round(1 / this.items[aaa] * 100000) / 100000
          this.currencyInfo[i].rateExpected = Math.round(1 / this.items[aaa] * 100000) / 100000
        }
      }
    },
    setCurrentRate: function (index) {
      const pair = this.currencyInfo[index].name
      const aaa = this.currencyInfo[index].name.slice(0, 3)

      if (pair === 'USDJPY') {
        this.currencyInfo[index].rate = Math.round(this.items.JPY * 1000) / 1000
      } else {
        this.currencyInfo[index].rate = Math.round(1 / this.items[aaa] * 100000) / 100000
      }
    },
    setCurrentRateExpected: function (index) {
      const pair = this.currencyInfo[index].name
      const aaa = this.currencyInfo[index].name.slice(0, 3)

      if (pair === 'USDJPY') {
        this.currencyInfo[index].rateExpected = Math.round(this.items.JPY * 1000) / 1000
      } else {
        this.currencyInfo[index].rateExpected = Math.round(1 / this.items[aaa] * 100000) / 100000
      }
    }
  },
  mounted: function () {
    axios.get('https://api.ratesapi.io/api/latest?base=USD')
      .then(function (response) {
        app.items = response.data.rates
        app.getCurrentRates()
      })
  }
})

window.app = app