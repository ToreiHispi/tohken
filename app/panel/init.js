define((require, exports, module) => {
  const store = require('app/data/index')
  const TRHMasterData = require('app/core/master')
  const TRHRequestListener = require('app/panel/listener/index')
  const defaultConfig = require('app/data/model/config')
  const filters = require('app/panel/util/filter')

  // Load Master Data
  TRHMasterData.load(store)

  // Start Request Listener
  TRHRequestListener.init(store)

  Vue.component('debug-tools', {
    template: '#debug-tools-template',
    computed: Vuex.mapState(['debug']),
    methods: {
      startRecord () {
        store.commit(this.debug.config.inRecordMode ? 'debug/stopRecord' : 'debug/startRecord')
      },
      loadMasterData (ev) {
        const file = ev.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = function(e) {
          let contents = e.target.result.replace('data:application/octet-stream;base64,', '')
          TRHMasterData.init(contents, store)
        }
        reader.readAsDataURL(file)
      },
      loadRecord (ev) {
        const file = ev.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = function(e) {
          let contents = e.target.result
          store.commit('debug/loadRecord', JSON.parse(contents))
        }
        reader.readAsText(file)
      },
      replayMode () {
        store.commit('debug/replayMode')
      },
      playNext () {
        store.commit('debug/nextRecord', TRHRequestListener)
      },
      autoPlay () {
        store.commit('debug/autoRecord', TRHRequestListener)
      }
    }
  })

  Vue.component('notice-content', {
    template: '#notice-template',
    computed: Vuex.mapState(['notice']),
    methods: {
      close (n) {
        n.hidden = true
      }
    }
  })

  Vue.component('party-list', {
    template: '#party-list',
    props: ['party-no'],
    computed: Vuex.mapState({
      party (state) {
        return _.get(state, ['party', 'parties', this.partyNo], {})
      }
    })
  })

  Vue.component('sword-item', {
    template: '#sword-item',
    props: ['sword-serial-id'],
    computed: Vuex.mapState({
      sword (state) {
        return _.get(state, ['swords', 'serial', this.swordSerialId], {})
      }
    })
  })

  Vue.component('equip-item', {
    template: '#equip-item',
    props: ['equip-serial-id', 'in-battle'],
    computed: Vuex.mapState({
      equip (state) {
        return _.get(state, ['equip', 'serial', this.equipSerialId], {})
      }
    })
  })

  Vue.component('forge-item', {
    template: '#forge-item',
    props: ['slot-no'],
    computed: Vuex.mapState({
      forge (state) {
        return _.get(state, ['forge', 'slot', this.slotNo], {})
      }
    })
  })

  Vue.component('repair-item', {
    template: '#repair-item',
    props: ['slot-no'],
    computed: Vuex.mapState({
      repair (state) {
        return _.get(state, ['repair', 'slot', this.slotNo], {})
      }
    })
  })

  Vue.component('config-switch', {
    template: '#config-switch-template',
    props: ['attr'],
    computed: {
      attrValue () {
        return store.state.config[this.attr]
      }
    },
    methods: {
      on () {
        store.commit('config/updateConfig', { [this.attr]: true })
      },
      off () {
        store.commit('config/updateConfig', { [this.attr]: false })
      }
    }
  })

  const partyListWrapper = {
    template: `
      <div class="party-list-wrapper">
      <party-list v-for="i in 4" :key="i" :party-no="i"></party-list>
      </div>
    `
  }

  const Enemy = Vue.component('enemy', {
    template: '#enemy',
    computed: Vuex.mapState({
      sally (state){
        return _.get(state, ['sally'], {})
      },
      battle_scout (state){
        return _.get(state, ['battle','scout'], {})
      },
      battle_enemy (state){
        return _.get(state, ['battle','enemy'], {})
      },
      practice_enemy_equip (state){
        return _.get(state, ['practice_enemy','enemy_equip'], {})
      },
      practice_enemy_sword (state){
        return _.get(state, ['practice_enemy','enemy_sword'], {})
      },
      practice_enemy_party (state){
        return _.get(state, ['practice_enemy','enemy_party','1'], {})
      },
      enemyList () {
        let enemy = TRHMasterData.getMasterData('Sword')
        return enemy
      }
    })
  })

  const Other = Vue.component('other', {
    template: '#other',
    data () {
      return {
        option: {
          info: false,
          value: false,
          equip: false
        }
      }
    },
    computed: {
      ...Vuex.mapState(['swords', 'party', 'equip', 'forge', 'repair', 'item', 'album', 'duty', 'evolution']),
      equipList () {
        let allEquips = _(this.equip.serial)
          .mapValues((v, k) => {
            let sword = _.find(store.state.swords.serial, o => o.horse_serial_id == k)
            return _.extend(v, {
              owner: sword ? sword.name : '-'
            })
          })
          .groupBy(o => o.equip_id)
          .mapValues((v, k) => {
            let owners = _(v).map(o => o.owner).filter(o => o != '-').value().join(',')
            return _.extend({
              count: v.length,
              owner: owners
            }, _.get(TRHMasterData.getMasterData('Equip'), [k], {}))
          })
          .values()
          .value()
        let equip = _.filter(allEquips, o => o.equipId < 10000)
        let horse = _.filter(allEquips, o => o.equipId >= 10000)
        return { equip , horse }
      },
      enemyList () {
        let enemy = TRHMasterData.getMasterData('Sword')
        return enemy
      }
    }
  })

  const Extra = Vue.component('extra', {
    template: '#extra',
    computed: {
      ...Vuex.mapState(['log'])
    },
    methods: {
      removeLog (name) {
        localforage.removeItem(`${name}`)
      },
      saveLog (name) {
        if(name == 'ForgeLog') {
          ForgeLog = "\"番号\",\"刀名\",\"木炭\",\"玉鋼\",\"冷却材\",\"砥石\",\"御札\",\"结束时间\""
          _.forEach(_.get(store.state, ['log','forge']), function(_this) {
            ForgeLog += "\n\"'" + (_this.sword_id ? _this.sword_id : '-') + "\",\"'" + (_this.sword_id ? _.get(TRHMasterData.getMasterData('Sword'), [_this.sword_id, 'name'], '-') : '空') + "\",\"'" + (_this.charcoal ? _this.charcoal : '-') + "\",\"'" + (_this.steel ? _this.steel : '-') + "\",\"'" + (_this.coolant ? _this.coolant : '-') + "\",\"'" + (_this.file ? _this.file : '-') + "\",\"'" + (_this.consumable_id ? _this.consumable_id : '-') + "\",\"'" + (moment(_this.finished_at).format('MM/DD HH:mm:ss')) + "\""
          })
          blob = new Blob([ForgeLog], {
            type: "text/plain;charset=utf-8"
          });
          saveAs(blob, "TRHForge" + (Date.now()) + ".csv");
        }
        else if(name == 'BattleLog') {
          BattleLog = "\"部隊\",\"刀名\",\"時代-地域\",\"階数\",\"戦闘地ID\",\"評価\",\"戦闘時点\""
          _.forEach(_.get(store.state, ['log','battle']), function(_this) {
            rank_name = ['0', '一騎', 'S', 'A', 'B', 'C', '敗北'][_this.rank] || ''
            BattleLog += "\n\"'" + (_this.party_no ? _this.party_no : '-') + "\",\"'" + (_this.get_sword_id ? _.get(TRHMasterData.getMasterData('Sword'), [_this.get_sword_id, 'name'], '-') : '空') + "\",\"'" + (_this.episode_id ? _this.episode_id : '-') + '-' + (_this.field_id ? _this.field_id : '-') + "\",\"'" + (_this.layer_num ? _this.layer_num : '-') + "\",\"'" + (_this.square_id ? _this.square_id : '-') + "\",\"'" + (rank_name) + "\",\"'" + (moment(_this.now).format('MM/DD HH:mm:ss')) + "\""
          })
          blob = new Blob([BattleLog], {
            type: "text/plain;charset=utf-8"
          });
          saveAs(blob, "TRHBattle" + (Date.now()) + ".csv");
        }
        else if(name == 'PracticeLog') {
          PracticeLog = "\"部隊\",\"敵名\",\"敵LV\",\"評価\",\"戦闘時点\""
          _.forEach(_.get(store.state, ['log','practice']), function(_this) {
            rank_name = ['0', '一騎', 'S', 'A', 'B', 'C', '敗北'][_this.rank] || ''
            PracticeLog += "\n\"'" + (_this.party_no ? _this.party_no : '-') + "\",\"'" + (_this.enemy_name ? _this.enemy_name : '-') + "\",\"'" + "Lv." + (_this.enemy_level) + "\",\"'" + (rank_name) + "\",\"'" + (moment(_this.now).format('MM/DD HH:mm:ss')) + "\""
          })
          blob = new Blob([PracticeLog], {
            type: "text/plain;charset=utf-8"
          });
          saveAs(blob, "TRHPractice" + (Date.now()) + ".csv");
        }
      }
    }
  })

  const Setting = Vue.component('setting', {
    template: '#setting',
    computed: {
      ..._.mapValues(store.state.config, (v, k) => {
          return {
            get () {
              return store.state.config[k]
            },
            set (value) {
              store.commit('config/updateConfig', { [k]: value })
            }
          }
        })
    }
  })

  const router = new VueRouter({
    routes: [
      { path: '/', redirect: '/party' },
      { path: '/party', components: { 'party-list-wrapper': partyListWrapper } },
      { path: '/enemy', component: Enemy },
      { path: '/other', component: Other },
      { path: '/extra', component: Extra },
      { path: '/setting', component: Setting }
    ]
  })

  Vue.filter('averageLevel', (party) => {
    return 0
  })

  Vue.filter('totalLevel', (party) => {
    return 0
  })

  Vue.component('resource-panel', {
    template: '#resource-panel',
    computed: Vuex.mapState(['resource', 'player', 'item'])
  })

  return new Vue({
    el: '#app',
    store,
    router,
    data: {
      devtools: !!chrome.devtools
    },
    computed: {
      ...Vuex.mapState(['inBattle', 'dataLoaded', 'swords', 'party', 'config', 'debug'])
    },
    mounted () {
      localforage.getItem('Config').then((data) => {
        store.commit('config/updateConfig', data || {})
      })

      localforage.getItem('BattleLog').then((data) => {
        //console.log(data)
        if (data) _.each(data, (v,k) => store.commit('log/addBattleLog', v))
      })

      localforage.getItem('ForgeLog').then((data) => {
        //console.log(data)
        if (data) _.each(data, v => store.commit('log/addForgeLog', v))
      })

      localforage.getItem('PracticeLog').then((data) => {
        //console.log(data)
        if (data) _.each(data, v => store.commit('log/addPracticeLog', v))
      })

      localforage.getItem('Resource').then((data) => {
        if (data) store.commit('resource/updateResource', {
          updateData: data
        })
      })

      localforage.getItem('Equip').then((data) => {
        if (data && data.serial) _.each(data.serial, v => store.commit('equip/updateEquip', {
          serialId: v.serial_id,
          updateData: v
        }))
      })

      localforage.getItem('Swords').then((data) => {
        if (data && data.serial) _.each(data.serial, v => store.commit('swords/updateSword', {
          serialId: v.serial_id,
          updateData: v
        }))
      })

      localforage.getItem('Party').then((data) => {
        if (data && data.parties) _.each(data.parties, v => {
          v.isIntervalSet = false
          v.isNoticed = false
          store.commit('party/updateParty', {
            partyNo: v.party_no,
            updateData: v
          })
        })
      })

      localforage.getItem('Item').then((data) => {
        if(data && data.consumable) _.each(data.consumable, (v, k) => store.commit('item/updateItem', {
          consumableId: k,
          updateData: v
        }))
      })

      localforage.getItem('Player').then((data) => {
        if(data) store.commit('player/updatePlayer', {
          updateData: data
        })
      })

      localforage.getItem('Duty').then((data) => {
        if(data) {
          data.isIntervalSet = false
          store.commit('duty/updateDuty', {
            updateData: data
          })
        }
      })

      localforage.getItem('Evolution').then((data) => {
        if(data) {
          data.back[0].isIntervalSet = false
          store.commit('evolution/updateEvolution', {
            updateData: data
          })
        }
      })
    },
    methods: {
      scroll (name) {
        if (!$(`#${name}`).offset()) return
        window.scrollTo(0, $(`#${name}`).offset().top - 80)
      }
    }
  })
})
