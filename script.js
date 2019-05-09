const currencyInfo = [
  {
    name: 'EURUSD',
    rate: 1.12030,
    rateExpected: 1.12030
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
  lot: 0.01
}

const vm = new Vue({
  el: '#app',
  data: {
    unrealizedValue: 0,

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

    positions: [

    ],
    currencyInfo,
    form
  },
  computed: {
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
    entryRate: function () {
      const pair = this.form.pair
      const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
        return (currencyInfoItem.name === pair)
      })
      console.log(currencyInfo)

      return currencyInfo.rate
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
    addPosition: function () {
      this.positions.push({
        pair: this.form.pair,
        action: this.form.action,
        lot: this.form.lot,
        entryRate: this.entryRate
      })
    },
    deletePosition: function (index) {
      this.positions.splice(index, 1)
    }
  }
})