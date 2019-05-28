<template>
  <v-container>
    <ul>
      <li>残高 {{ balance | withDelimiter }} 円</li>
      <li>ピップス {{ pips }} pips</li>
      <li>有効証拠金 {{ equity | withDelimiter }} 円</li>
      <li v-show="positions.length > 0">証拠金維持率 {{ marginLevel | withDelimiter }} ％</li>
      <li>必要証拠金 {{ necessaryMargin | withDelimiter }} 円</li>
    </ul>

    <v-text-field v-model.number="balance" label="残高" suffix="円" required></v-text-field>

    <v-radio-group v-model="broker">
      <v-radio value="overseas" label="海外"></v-radio>
      <v-radio value="japan" label="日本"></v-radio>
    </v-radio-group>

    <v-select :items="leverages[broker]" label="レバレッジ" v-model="leverage[broker]" suffix="倍"></v-select>

    <template v-for="(pair, index) in pairs">
      <v-text-field :key="index" v-model.number="pair.rateExpected" :label="pair.name" required></v-text-field>
      <v-btn color="info" @click="setCurrentRate(index)">現在レート</v-btn>
    </template>

    <v-data-table :headers="positionHeaders" :items="positions" class="elevation-1">
      <template v-slot:items="props">
        <td>{{ props.item.pair }}</td>
        <td>{{ props.item.action }}</td>
        <td class="text-xs-right">{{ props.item.lot }}</td>
        <td class="text-xs-right">{{ props.item.entryRate }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
    <!-- <pre>{{ $data }}</pre> -->
  </v-container>
</template>

<script>
import axios from "axios";

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

export default {
  data() {
    return {
      balance: 200000,
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
        { text: "ロット", value: "lot" },
        { text: "レート", value: "entryRate" }
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
    };
  },
  computed: {
    unrealizedValue() {
      let unrealizedValue = 0;

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1];
        const pair = this.positions[i].pair;
        const pairInfo = this.pairs.find(function(pairInfo) {
          return pairInfo.name === pair;
        });

        if (pairInfo.name === USDJPY.name) {
          // ドル円の処理
          if (this.positions[i].action === "buy") {
            unrealizedValue +=
              (pairInfo.rateExpected - this.positions[i].entryRate) *
              this.tradingUnits[this.broker] *
              this.positions[i].lot;
          } else {
            unrealizedValue +=
              -(pairInfo.rateExpected - this.positions[i].entryRate) *
              this.tradingUnits[this.broker] *
              this.positions[i].lot;
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === "buy") {
            unrealizedValue +=
              (pairInfo.rateExpected - this.positions[i].entryRate) *
              this.tradingUnits[this.broker] *
              this.positions[i].lot *
              USDJPY.rate;
          } else {
            unrealizedValue +=
              -(pairInfo.rateExpected - this.positions[i].entryRate) *
              this.tradingUnits[this.broker] *
              this.positions[i].lot *
              USDJPY.rate;
          }
        }
      }

      return Math.round(unrealizedValue);
    },
    pips() {
      let pips = 0;

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1];
        const pair = this.positions[i].pair;
        const pairInfo = this.pairs.find(function(pairInfo) {
          return pairInfo.name === pair;
        });

        if (pairInfo.name === USDJPY.name) {
          // ドル円の処理
          if (this.positions[i].action === "buy") {
            pips += (pairInfo.rateExpected - this.positions[i].entryRate) * 100;
          } else {
            pips +=
              -(pairInfo.rateExpected - this.positions[i].entryRate) * 100;
          }
        } else {
          // それ以外の通貨ペアの処理
          if (this.positions[i].action === "buy") {
            pips +=
              (pairInfo.rateExpected - this.positions[i].entryRate) * 10000;
          } else {
            pips +=
              -(pairInfo.rateExpected - this.positions[i].entryRate) * 10000;
          }
        }
      }

      return Math.round(pips * 10) / 10;
    },
    equity() {
      return this.balance + this.unrealizedValue;
    },
    necessaryMargin() {
      let necessaryMargin = 0;

      for (let i = 0; i < this.positions.length; i++) {
        const USDJPY = this.pairs[1];
        const pair = this.positions[i].pair;
        const pairInfo = this.pairs.find(function(pairInfo) {
          return pairInfo.name === pair;
        });

        if (pairInfo.name === "USDJPY") {
          // ドル円の処理
          necessaryMargin +=
            (USDJPY.rate *
              this.tradingUnits[this.broker] *
              this.positions[i].lot) /
            this.leverage[this.broker];
        } else {
          // それ以外の通貨ペアの処理
          necessaryMargin +=
            (pairInfo.rate *
              USDJPY.rate *
              this.tradingUnits[this.broker] *
              this.positions[i].lot) /
            this.leverage[this.broker];
        }
      }
      // 必要証拠金 = 為替レート × Lot数 ÷ レバレッジ比率

      return Math.round(necessaryMargin);
    },
    marginLevel() {
      if (this.positions.length) {
        return Math.round((this.equity / this.necessaryMargin) * 10000) / 100;
      } else {
        return this.equity;
      }
    },
    balanceGap() {
      return Math.round(
        (this.targetMarginLevel * this.necessaryMargin) / 100 - this.equity
      );
    }
  },
  methods: {
    setEntryRate: function() {
      const pair = this.positionForm.pair;
      const pairInfo = this.pairs.find(function(pairInfo) {
        return pairInfo.name === pair;
      });

      this.positionForm.entryRate = pairInfo.rate;
    },
    addPosition: function() {
      this.positions.push({
        pair: this.positionForm.pair,
        action: this.positionForm.action,
        lot: this.positionForm.lot,
        entryRate: this.positionForm.entryRate
      });
    },
    deletePosition: function(index) {
      if (confirm("削除してもよろしいですか？")) {
        this.positions.splice(index, 1);
      }
    },
    getCurrentRates: function() {
      for (let i = 0; i < this.pairs.length; i++) {
        const pair = this.pairs[i].name;
        const keyCurrency = this.pairs[i].name.slice(0, 3);

        if (pair === "USDJPY") {
          this.pairs[i].rate = Math.round(this.pairsFromAPI.JPY * 1000) / 1000;
          this.pairs[i].rateExpected =
            Math.round(this.pairsFromAPI.JPY * 1000) / 1000;
        } else {
          this.pairs[i].rate =
            Math.round((1 / this.pairsFromAPI[keyCurrency]) * 100000) / 100000;
          this.pairs[i].rateExpected =
            Math.round((1 / this.pairsFromAPI[keyCurrency]) * 100000) / 100000;
        }
      }
    },
    setCurrentRate: function(index) {
      const pair = this.pairs[index].name;
      const keyCurrency = this.pairs[index].name.slice(0, 3);

      if (pair === "USDJPY") {
        this.pairs[index].rateExpected =
          Math.round(this.pairsFromAPI.JPY * 1000) / 1000;
      } else {
        this.pairs[index].rateExpected =
          Math.round((1 / this.pairsFromAPI[keyCurrency]) * 100000) / 100000;
      }
    },
    loginMyfxbook: function() {
      const self = this;
      const params = {
        email: this.myfxbookEmail,
        password: this.myfxbookPassword
      };

      axios
        .get("https://kotahashihama.com/fx-calculator/myfxbook-login.php", {
          params
        })
        .then(function(response) {
          app.myfxbookSession = response.data.session;
          app.getOpenTrades();
        });
    },
    getOpenTrades: function() {
      const self = this;
      const params = { session: this.myfxbookSession, id: this.myfxbookId };

      axios
        .get("https://kotahashihama.com/fx-calculator/myfxbook-trades.php", {
          params
        })
        .then(function(response) {
          const openTrades = response.data.openTrades;

          console.log(openTrades);
          for (let i = 0; i < openTrades.length; i++) {
            app.positions.push({
              pair: openTrades[i].symbol,
              action: openTrades[i].action.toLowerCase(),
              lot: openTrades[i].sizing.value,
              entryRate: openTrades[i].openPrice
            });
          }
        });
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    }
  },
  filters: {
    withDelimiter: function(value) {
      return value.toLocaleString();
    }
  },
  mounted: function() {
    const self = this;

    axios
      .get("https://api.ratesapi.io/api/latest?base=USD")
      .then(function(response) {
        self.pairsFromAPI = response.data.rates;
        self.getCurrentRates();
        self.positionForm.entryRate =
          Math.round((1 / self.pairsFromAPI["EUR"]) * 100000) / 100000;
      });
  }
};
</script>

