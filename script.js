const currencyInfo = [
  {
    name: 'EURUSD',
    rate: 1.12030
  },
  {
    name: 'USDJPY',
    rate: 110.148
  },
  {
    name: 'GBPUSD',
    rate: 1.30377
  },
  {
    name: 'AUDUSD',
    rate: 0.70186
  }
]

const form = {
  pair: currencyInfo[0].name,
  action: 'buy',
  lot: 0.01,
  entryRate: currencyInfo[0].rate
}

const vm = new Vue({
  el: '#app',
  data: {
    pips: 0,
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
    necessaryMargin: function () {
      let totalNecessaryMargin = 0

      for (let i = 0; i < this.positions.length; i++) {
        const pair = this.positions[i].pair
        const currencyInfo = this.currencyInfo.find(function (currencyInfoItem) {
          return (currencyInfoItem.name === pair)
        })
        const usdJpyInfo = this.currencyInfo[1]
        console.log(currencyInfo.name)

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
        entryRate: this.form.entryRate
      })
    },
    deletePosition: function (index) {
      this.positions.splice(index, 1)
    }
  }
})