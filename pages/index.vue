<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-layout column>
          <v-flex>
            <v-card>
              <v-card-text>
                <ul>
                  <li>残高 {{ balance | withDelimiter }} 円</li>
                  <li>ピップス {{ pips }} pips</li>
                  <li>有効証拠金 {{ equity | withDelimiter }} 円</li>
                  <li v-show="positions.length > 0">証拠金維持率 {{ marginLevel | withDelimiter }} ％</li>
                  <li>必要証拠金 {{ necessaryMargin | withDelimiter }} 円</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex>
            <v-card>
              <v-toolbar flat>
                <v-toolbar-title>保有ポジション</v-toolbar-title>
                <v-divider class="mx-2" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark class="mb-2" v-on="on">追加</v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout wrap>
                          <v-flex xs12 sm6>
                            <v-select
                              :items="pairs"
                              item-text="name"
                              label="通貨ペア"
                              v-model="editedPosition.pair"
                              @change="setEntryRate"
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm6>
                            <v-radio-group v-model="editedPosition.action">
                              <v-radio label="買" value="buy"></v-radio>
                              <v-radio label="売" value="sell"></v-radio>
                            </v-radio-group>
                          </v-flex>
                          <v-flex xs12 sm6>
                            <v-text-field v-model="editedPosition.lot" label="ロット"></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm6>
                            <v-text-field v-model="editedPosition.entryRate" label="レート"></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" flat @click="close">キャンセル</v-btn>
                      <v-btn color="blue darken-1" flat @click="save">追加</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>

              <v-data-table :headers="positionHeaders" :items="positions">
                <template v-slot:items="props">
                  <td>{{ props.item.pair }}</td>
                  <td>{{ props.item.action }}</td>
                  <td class="text-xs-right">{{ props.item.lot }}</td>
                  <td class="text-xs-right">{{ props.item.entryRate }}</td>
                  <td class="justify-center layout px-0">
                    <v-icon small class="mr-2" @click="editPosition(props.item)">edit</v-icon>
                    <v-icon small @click="deletePosition(props.item)">delete</v-icon>
                  </td>
                </template>
              </v-data-table>
            </v-card>
          </v-flex>

          <v-flex>
            <v-card>
              <v-card-title>
                <span class="headline">ポジション取得（Myfxbook）</span>
              </v-card-title>

              <v-card-text>
                <template v-if="myfxbook.session <= 0">
                  <v-text-field v-model="myfxbook.email" label="メールアドレス"></v-text-field>
                  <v-text-field v-model="myfxbook.password" label="パスワード"></v-text-field>
                  <v-btn color="primary" @click="loginMyfxbook">ログイン</v-btn>
                </template>
                <template v-else>
                  <p>{{ myfxbook.email }}としてログイン中</p>
                  <v-text-field v-model="myfxbook.accountNumber" label="Myfxbook口座番号"></v-text-field>
                  <v-btn color="primary" @click="getOpenTrades">取得</v-btn>
                </template>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex xs12 sm6>
        <v-text-field v-model.number="balance" label="残高" suffix="円" required></v-text-field>

        <v-radio-group v-model="broker">
          <v-radio value="overseas" label="海外"></v-radio>
          <v-radio value="japan" label="日本"></v-radio>
        </v-radio-group>

        <v-select :items="leverages[broker]" label="レバレッジ" v-model="leverage[broker]" suffix="倍"></v-select>

        <div v-for="(pair, index) in pairs" :key="index">
          <v-layout row>
            <v-flex grow>
              <v-text-field v-model.number="pair.rateExpected" :label="pair.name" required></v-text-field>
            </v-flex>
            <v-flex shrink>
              <v-btn color="info" @click="setCurrentRate(index)">現在値</v-btn>
            </v-flex>
          </v-layout>
        </div>
      </v-flex>
      <!-- {{ $data }} -->
    </v-layout>
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

export default {
  data() {
    return {
      dialog: false,
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
          text: "通貨ペア",
          value: "pair"
        },
        { text: "売買", value: "action" },
        { text: "ロット", value: "lot" },
        { text: "レート", value: "entryRate" },
        { text: "操作", value: "operate" }
      ],
      positions: [],
      defaultPosition: {
        pair: pairs[0].name,
        action: "buy",
        lot: 0.01,
        entryRate: 0
      },
      editedPosition: {
        pair: "EURUSD",
        action: "buy",
        lot: 0.01,
        entryRate: 0
      },
      editedIndex: -1,

      pairs,
      pairsFromAPI: null,

      myfxbook: {
        email: "",
        password: "",
        session: "",
        accountNumber: "",
        openTrades: [
          {
            pair: "USDJPY",
            action: "buy",
            lot: 0.01,
            entryRate: 0
          }
        ]
      }
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
    },
    formTitle() {
      return this.editedIndex === -1
        ? "新規ポジションの追加"
        : "ポジションの編集";
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    setEntryRate: function() {
      const pair = this.editedPosition.pair;
      const pairInfo = this.pairs.find(function(pairInfo) {
        return pairInfo.name === pair;
      });

      this.editedPosition.entryRate = pairInfo.rate;
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
        email: this.myfxbook.email,
        password: this.myfxbook.password
      };

      axios
        .get("https://kotahashihama.com/fx-calculator/myfxbook-login.php", {
          params
        })
        .then(function(response) {
          if (response.data.error === false) {
            self.myfxbook.session = response.data.session;
            self.getOpenTrades();
          } else {
            alert(
              "ログインできませんでした。メールアドレスとパスワードをもう一度お試しください"
            );
          }
        });
    },
    getOpenTrades: function() {
      const self = this;
      const params = {
        session: this.myfxbook.session,
        id: this.myfxbook.accountNumber
      };

      axios
        .get("https://kotahashihama.com/fx-calculator/myfxbook-trades.php", {
          params
        })
        .then(function(response) {
          if (response.data.error === false) {
            console.log(response);
            const openTrades = response.data.openTrades;

            for (let i = 0; i < openTrades.length; i++) {
              self.positions = [];
              self.positions.push({
                pair: openTrades[i].symbol,
                action: openTrades[i].action.toLowerCase(),
                lot: openTrades[i].sizing.value,
                entryRate: openTrades[i].openPrice
              });
            }
          } else {
            alert("取得できませんでした。時間をおいてお試しください");
          }
        });
    },
    editPosition(item) {
      this.editedIndex = this.positions.indexOf(item);
      this.editedPosition = Object.assign({}, item);
      this.dialog = true;
    },

    deletePosition(item) {
      const index = this.positions.indexOf(item);
      confirm("本当に削除してもよろしいですか？") &&
        this.positions.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedPosition = Object.assign({}, this.defaultPosition);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.positions[this.editedIndex], this.editedPosition);
      } else {
        this.positions.push(this.editedPosition);
      }
      this.close();
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
        self.defaultPosition.entryRate =
          Math.round((1 / self.pairsFromAPI["EUR"]) * 100000) / 100000;
        self.editedPosition.entryRate =
          Math.round((1 / self.pairsFromAPI["EUR"]) * 100000) / 100000;
      });
  }
};
</script>

