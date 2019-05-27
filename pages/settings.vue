<template>
  <v-container>
    <v-layout>
      <v-flex>
        <!-- <div class="col-12 col-sm-6">
          <ul class="list-group">
            <li class="list-group-item">
              <p>業者</p>
              <label>
                <input type="radio" name="broker" value="overseas" v-model="broker">
                海外
              </label>
              <label>
                <input type="radio" name="broker" value="japan" v-model="broker">
                国内
              </label>
            </li>

            <li class="list-group-item">
              <p>レバレッジ</p>
              <select name id v-model="leverage[broker]" class="form-control">
                <option :value="leverage" v-for="leverage in leverages[broker]">{{ leverage }}</option>
              </select>
              倍
            </li>

            <li class="list-group-item">
              <p>仮定レート</p>

              <div v-for="(pair, index) in pairs">
                <div class="form-group">
                  <label for>{{ pair.name }}</label>
                  <div class="input-group">
                    <input
                      type="number"
                      min="0.00001"
                      step="0.00001"
                      v-model="pair.rateExpected"
                      class="form-control"
                    >
                    <div class="input-group-append">
                      <button
                        @click="setCurrentRateExpected(index)"
                        class="btn btn-outline-primary"
                      >現在レート</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>-->
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {};
</script>

