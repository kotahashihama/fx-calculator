const pairs = [
  {
    name: "EURUSD",
    rate: 0,
    rateExpected: 0
  },
  {
    name: "USDJPY",
    rate: 0,
    rateExpected: 0
  },
  {
    name: "GBPUSD",
    rate: 0,
    rateExpected: 0
  },
  {
    name: "AUDUSD",
    rate: 0,
    rateExpected: 0
  }
];

const positionForm = {
  pair: pairs[0].name,
  action: "buy",
  lot: 0.01,
  entryRate: 0
};

export const state = () => ({
  balance: 0,
  broker: "overseas",
  leverage: {
    overseas: 1000,
    japan: 25
  },
  targetMarginLevel: 1000,

  tradingUnits: {
    overseas: 100000,
    japan: 10000
  },
  leverages: {
    overseas: [1000, 888, 500, 200],
    japan: [25, 20, 10, 5]
  },

  positionHeaders: [
    {
      text: "ペア",
      value: "pair"
    },
    { text: "売買", value: "action" },
    { text: "レート", value: "entryRate" },
    { text: "ロット", value: "lot" }
  ],
  positions: [
    {
      pair: "USDJPY",
      action: "buy",
      lot: 0.01,
      entryRate: 110
    },
    {
      pair: "EURUSD",
      action: "sell",
      lot: 0.02,
      entryRate: 1.12
    },
    {
      pair: "USDJPY",
      action: "buy",
      lot: 0.01,
      entryRate: 110
    }
  ],
  positionForm,

  pairs,
  pairsFromAPI: null,

  myfxbookEmail: "",
  myfxbookPassword: "",
  myfxbookSession: "",
  myfxbookId: "",
  openTrades: [
    {
      pair: "USDJPY",
      action: "buy",
      lot: 0.01,
      entryRate: 0
    }
  ]
});

export const getters = {
  unrealizedValue(state) {
    let unrealizedValue = 0;

    for (let i = 0; i < state.positions.length; i++) {
      const USDJPY = state.pairs[1];
      const pair = state.positions[i].pair;
      const pairInfo = state.pairs.find(function(pairInfo) {
        return pairInfo.name === pair;
      });

      if (pairInfo.name === USDJPY.name) {
        // ドル円の処理
        if (state.positions[i].action === "buy") {
          unrealizedValue +=
            (pairInfo.rateExpected - state.positions[i].entryRate) *
            state.tradingUnits[state.broker] *
            state.positions[i].lot;
        } else {
          unrealizedValue +=
            -(pairInfo.rateExpected - state.positions[i].entryRate) *
            state.tradingUnits[state.broker] *
            state.positions[i].lot;
        }
      } else {
        // それ以外の通貨ペアの処理
        if (state.positions[i].action === "buy") {
          unrealizedValue +=
            (pairInfo.rateExpected - state.positions[i].entryRate) *
            state.tradingUnits[state.broker] *
            state.positions[i].lot *
            USDJPY.rate;
        } else {
          unrealizedValue +=
            -(pairInfo.rateExpected - state.positions[i].entryRate) *
            state.tradingUnits[state.broker] *
            state.positions[i].lot *
            USDJPY.rate;
        }
      }
    }

    return Math.round(unrealizedValue);
  },
  pips(state) {
    let pips = 0;

    for (let i = 0; i < state.positions.length; i++) {
      const USDJPY = state.pairs[1];
      const pair = state.positions[i].pair;
      const pairInfo = state.pairs.find(function(pairInfo) {
        return pairInfo.name === pair;
      });

      if (pairInfo.name === USDJPY.name) {
        // ドル円の処理
        if (state.positions[i].action === "buy") {
          pips += (pairInfo.rateExpected - state.positions[i].entryRate) * 100;
        } else {
          pips += -(pairInfo.rateExpected - state.positions[i].entryRate) * 100;
        }
      } else {
        // それ以外の通貨ペアの処理
        if (state.positions[i].action === "buy") {
          pips +=
            (pairInfo.rateExpected - state.positions[i].entryRate) * 10000;
        } else {
          pips +=
            -(pairInfo.rateExpected - state.positions[i].entryRate) * 10000;
        }
      }
    }

    return Math.round(pips * 10) / 10;
  },
  equity(state, getters) {
    return state.balance + getters.unrealizedValue;
  },
  necessaryMargin(state) {
    let necessaryMargin = 0;

    for (let i = 0; i < state.positions.length; i++) {
      const USDJPY = state.pairs[1];
      const pair = state.positions[i].pair;
      const pairInfo = state.pairs.find(function(pairInfo) {
        return pairInfo.name === pair;
      });

      if (pairInfo.name === "USDJPY") {
        // ドル円の処理
        necessaryMargin +=
          (USDJPY.rate *
            state.tradingUnits[state.broker] *
            state.positions[i].lot) /
          state.leverage[state.broker];
      } else {
        // それ以外の通貨ペアの処理
        necessaryMargin +=
          (pairInfo.rate *
            USDJPY.rate *
            state.tradingUnits[state.broker] *
            state.positions[i].lot) /
          state.leverage[state.broker];
      }
    }
    // 必要証拠金 = 為替レート × Lot数 ÷ レバレッジ比率

    return Math.round(necessaryMargin);
  },
  marginLevel(state) {
    if (state.positions.length) {
      return Math.round((state.equity / state.necessaryMargin) * 10000) / 100;
    } else {
      return 0;
    }
  },
  balanceGap(state) {
    return Math.round(
      (state.targetMarginLevel * state.necessaryMargin) / 100 - state.equity
    );
  }
};

export const mutations = {
  updateBalance(state, balance) {
    state.balance = balance;
  },
  updateBroker(state, broker) {
    state.broker = broker;
  },
  updateLeverage(state, leverage) {
    state.leverage = leverage;
  }
};
