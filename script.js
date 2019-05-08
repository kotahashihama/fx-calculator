const pairs = [
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
  pair: pairs[0].name,
  action: 'buy',
  lot: 0.01,
  entryRate: pairs[0].rate
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

    positions: [],
    pairs,
    form
  },
  computed: {
    lot: function () {
      let totalLot = 0
      for (let i = 0; i < this.positions.length; i++) {
        totalLot += this.positions[i].lot
      }
      return totalLot
    },
    necessaryMargin: function () {
      let totalNecessaryMargin = 0
      for (let i = 0; i < this.positions.length; i++) {
        totalNecessaryMargin += this.positions[i].necessaryMargin
      }
      return totalNecessaryMargin
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
      const pair = this.form.pair
      const target = this.pairs.find(function (p) {
        return (p.name === pair)
      })
      console.log(target.name)

      if (target.name === 'USDJPY') {
        this.positions.push({
          pair,
          action: this.form.action,
          lot: this.form.lot,
          entryRate: this.form.entryRate,
          necessaryMargin: Math.round(this.form.entryRate * this.standardSizes[this.broker] * this.form.lot / this.leverage),
        })
      } else {
        this.positions.push({
          pair,
          action: this.form.action,
          lot: this.form.lot,
          entryRate: this.form.entryRate,
          necessaryMargin: Math.round(target.rate * this.form.entryRate * this.standardSizes[this.broker] * this.form.lot / this.leverage)
        })
      }
    },
    leverage: function () {
      this.leverages[broker][0]
    }
  }
})