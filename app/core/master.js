define((require, exports, module) => {
  return class TRHMasterData {
		static getMasterData (k) {
			return TRHMasterData[k]
		}
    // Load data from local cache
    static load (store) {
      if (!chrome.devtools) {
        _.each(['UserLevel', 'SwordLevel', 'Sword', 'Equip', 'Consumable', 'FieldSquare', "Event", "EventLayer", "EventSquare"], k => {
          store.commit('loadData', {
            key: k,
            loaded: true
          })
        })
      }
      return Promise.props({
        UserLevel: localforage.getItem('UserLevelMaster'),
        SwordLevel: localforage.getItem('SwordLevelMaster'),
        Sword: localforage.getItem('SwordMaster'),
        Equip: localforage.getItem('EquipMaster'),
        Consumable: localforage.getItem('ConsumableMaster'),
        FieldSquare: localforage.getItem('FieldSquareMaster'),
        Event: localforage.getItem('EventMaster'),
        EventLayer: localforage.getItem('EventLayerMaster'),
        EventSquare: localforage.getItem('EventSquareMaster')
      }).then((saved) => {
        console.log('loadLocal')
        _.each(saved, (v, k) => {
          TRHMasterData[k] = v
			console.log('MasterData',k,TRHMasterData[k])
          store.commit('loadData', {
            key: k,
            loaded: !_.isNull(v)
          })
        })
      })
    }
    // Init data from Game Resource
    static init (content, store) {
      TRHMasterData.masterData = null
      // Convert data type
      let encodeData = atob(content)
      let convertTemp = encodeData.split('').map(x => x.charCodeAt(0))
      let originData = new Uint8Array(convertTemp)
      // Pack Zlib inflate
      let inflatedData = pako.inflate(originData)
      // Decrypt
      let decryptData = CryptoJS.AES.decrypt({
        ciphertext: CryptoJS.lib.WordArray.create(inflatedData)
      },
        CryptoJS.enc.Utf8.parse('xTs|0dw2swypRrry'), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        }
      )
      // Magic ?
      let jsonText = CryptoJS.enc.Utf8.stringify(decryptData)
      jsonText = jsonText.substr(0, jsonText.lastIndexOf('}') + 1)
      jsonText = jsonText.replace(/\'/g,'');
      // To Object
      let dataObj = JSON.parse(jsonText)
      // Take useful part
      TRHMasterData.masterData = dataObj
	  Object.keys(TRHMasterData.masterData).forEach((k) => {
		console.log(`TRHMasterData.init${k}(store),`);
	  });
	  Object.entries(TRHMasterData.masterData).forEach(([k, v]) => {
		console.log(k)
		v.split('\n')
		.map((line) => {
			let arr = line.split(',')
			//console.log(arr);
		})
	  });
      // level_master
      TRHMasterData.UserLevel = null
      // sword_level_master
      TRHMasterData.SwordLevel = null
      // sword_master
      TRHMasterData.Sword = null
      // equip_master
      TRHMasterData.Equip = null
      // consumable_master
      TRHMasterData.Consumable = null
      // field_square_master
      TRHMasterData.FieldSquare = null
      // event_master
      TRHMasterData.Event = null
      // event_layer_master
      TRHMasterData.EventLayer = null
      // event_square_master
      TRHMasterData.EventSquare = null
      // wait promise
      return Promise.all([
        TRHMasterData.initUserLevelMaster(store),
        TRHMasterData.initSwordLevelMaster(store),
        TRHMasterData.initSwordMaster(store),
        TRHMasterData.initEquipMaster(store),
        TRHMasterData.initConsumableMaster(store),
        TRHMasterData.initFieldSquareMaster(store),
        TRHMasterData.initEventMaster(store),
        TRHMasterData.initEventLayerMaster(store),
        TRHMasterData.initEventSquareMaster(store)/*,

		TRHMasterData.initEpisodeMaster(store),
		TRHMasterData.initFormationMaster(store),
		TRHMasterData.initMissionMaster(store),
		TRHMasterData.initMissionRewardMaster(store),
		TRHMasterData.initConquestMaster(store),
		TRHMasterData.initConquestRewardMaster(store),
		TRHMasterData.initFurnitureMaster(store),
		TRHMasterData.initConquestFieldMaster(store),
		TRHMasterData.initSceneMaster(store),
		TRHMasterData.initVoiceMaster(store),
		TRHMasterData.initMissionConditionMaster(store),
		TRHMasterData.initSwordCompositionMaster(store),
		TRHMasterData.initEventFieldMaster(store),
		TRHMasterData.initFurnitureShopMaster(store),
		TRHMasterData.initFurnitureItemMaster(store),
		TRHMasterData.initEventGimmickCardMaster(store),
		TRHMasterData.initEventPointRewardMaster(store),
		TRHMasterData.initLayerMaster(store),
		TRHMasterData.initAnniversaryEffectMaster(store),
		TRHMasterData.initAnniversaryVoiceMaster(store),
		TRHMasterData.initAnniversaryVoiceSwordMaster(store),
		TRHMasterData.initExchangeMaster(store),
		TRHMasterData.initExchangeRequirementMaster(store),
		TRHMasterData.initSwordBgmMaster(store),
		TRHMasterData.initEventRewardMaster(store),
		TRHMasterData.initEventClearRewardMaster(store),
		TRHMasterData.initEventFoxTextMaster(store),
		TRHMasterData.initEventTreasureBoxesRoomMaster(store),
		TRHMasterData.initLetterMaster(store),
		TRHMasterData.initConquestConditionMaster(store),
		TRHMasterData.initLimitedExchangeMaster(store),
		TRHMasterData.initLimitedExchangeContentsMaster(store),
		//TRHMasterData.initEventSceneDetailMaster(store),
		//TRHMasterData.initSeasonMaster(store),
		TRHMasterData.initSeasonExchangeMaster(store),
		//TRHMasterData.initPowerfulTextMaster(store),
		TRHMasterData.initFieldFoxTextMaster(store),
		TRHMasterData.initCostumeItemMaster(store),
		//TRHMasterData.initSwordEvolNormalMaster(store),
		TRHMasterData.initTutorialFoxTextMaster(store),
		TRHMasterData.initTipsMaster(store)*/
      ]).then(() => {
        console.log('done',store)
      })
    }
    // Init User Level Data
    static initUserLevelMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.UserLevel = _(TRHMasterData.masterData.LevelMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['level'] = _.toInteger(arr[0])
          obj['exp'] = _.toInteger(arr[1])
          obj['maxResource'] = _.toInteger(arr[2])
          obj['money'] = _.toInteger(arr[3])
          return obj
        })
        .keyBy('level')
        .value()
      return localforage.setItem('UserLevelMaster', TRHMasterData.UserLevel)
        .then(() => {
          //console.log('UserLevel set',TRHMasterData.UserLevel)
          store.commit('loadData', {
            key: 'UserLevel',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'UserLevel',
            loaded: false
          })
        })
    }

    // Init Sword Level Data
    static initSwordLevelMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.SwordLevel = _(TRHMasterData.masterData.SwordLevelMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['type'] = _.toInteger(arr[0])
          obj['level'] = _.toInteger(arr[1])
          obj['exp'] = _.toInteger(arr[2])
          return obj
        })
        .groupBy('type')
        .mapValues((val) => {
          return _(val).keyBy('level').mapValues(v => v.exp).value()
        })
        .value()
      return localforage.setItem('SwordLevelMaster', TRHMasterData.SwordLevel)
        .then(() => {
          //console.log('SwordLevel ShareWorld set',TRHMasterData.SwordLevel)
          store.commit('loadData', {
            key: 'SwordLevel',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'SwordLevel',
            loaded: false
          })
        })
    }

    // Init Sword Data
    static initSwordMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.Sword = _(TRHMasterData.masterData.SwordMaster)
        .split('\n')
        .map((line) => {
          let swordNickname = {
            3:"",
            5:"",
            7:"",
            9:"",
            11:"",
            12:""
          }
          let arr = line.split(',')
          let obj = {}
          obj['swordId'] = _.toInteger(arr[0])
          obj['baseId'] = _.toInteger(arr[1])
          obj['name'] = arr[2]
          if(swordNickname[arr[0]]){
            obj['name'] = swordNickname[arr[0]]
          }
          obj['alias'] = arr[3] // Furigana
          obj['symbol'] = _.toInteger(arr[4]) // Evol ID (0 Normal, 1 Toku, 2 Kiwame)
          obj['styleId'] = _.toInteger(arr[5]) // School
          obj['type'] = _.toInteger(arr[6])
          obj['realType'] = _.toInteger(arr[7])
          obj['rarity'] = _.toInteger(arr[8])
          obj['maxLevel'] = _.toInteger(arr[9])
          obj['???'] = _.toInteger(arr[10]) // HRA vs Touken
          obj['hp'] = _.toInteger(arr[11])
          obj['atk'] = _.toInteger(arr[12])
          obj['def'] = _.toInteger(arr[13])
          obj['mobile'] = _.toInteger(arr[14])
          obj['back'] = _.toInteger(arr[15])
          obj['scout'] = _.toInteger(arr[16])
          obj['hide'] = _.toInteger(arr[17])
          obj['hpUp'] = _.toInteger(arr[18])
          obj['atkUp'] = _.toInteger(arr[19])
          obj['defUp'] = _.toInteger(arr[20])
          obj['mobileUp'] = _.toInteger(arr[21])
          obj['backUp'] = _.toInteger(arr[22])
          obj['scoutUp'] = _.toInteger(arr[23])
          obj['hideUp'] = _.toInteger(arr[24])
          obj['getCharcoal'] = _.toInteger(arr[25])
          obj['getSteel'] = _.toInteger(arr[26])
          obj['getCoolant'] = _.toInteger(arr[27])
          obj['getFile'] = _.toInteger(arr[28])
          obj['careCharcoal'] = _.toInteger(arr[29])
          obj['careSteel'] = _.toInteger(arr[30])
          obj['careCoolant'] = _.toInteger(arr[31])
          obj['careFile'] = _.toInteger(arr[32])
          obj['equipSlot'] = _.toInteger(arr[33])
          obj['loyalties'] = _.toInteger(arr[34])
          obj['artist'] = arr[35]
          obj['voiceActor'] = arr[36]
          obj['imageId'] = _.toInteger(arr[37])
          obj['shareWord'] = _.toInteger(arr[38]) // Exp Table
          return obj
        })
        .keyBy('swordId')
        .value()
      return localforage.setItem('SwordMaster', TRHMasterData.Sword)
        .then(() => {
          //console.log('Sword set',TRHMasterData.Sword)
          store.commit('loadData', {
            key: 'Sword',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'Sword',
            loaded: false
          })
        })
    }

    // Init Equip Data
    static initEquipMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.Equip = _(TRHMasterData.masterData.EquipMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['equipId'] = _.toInteger(arr[0])
          obj['name'] = arr[1]
          obj['description'] = arr[2]
          obj['type'] = _.toInteger(arr[3])
          obj['rarity'] = _.toInteger(arr[4])
          obj['atk'] = _.toInteger(arr[5])
          obj['def'] = _.toInteger(arr[6])
          obj['mobility'] = _.toInteger(arr[7])
          obj['back'] = _.toInteger(arr[8])
          obj['scout'] = _.toInteger(arr[9])
          obj['hide'] = _.toInteger(arr[10])
          obj['soldier'] = _.toInteger(arr[11])
          obj['disposeCharcoal'] = _.toInteger(arr[12])
          obj['disposeSteel'] = _.toInteger(arr[13])
          obj['disposeCoolant'] = _.toInteger(arr[14])
          obj['disposeFile'] = _.toInteger(arr[15])
          return obj
        })
        .keyBy('equipId')
        .value()
      return localforage.setItem('EquipMaster', TRHMasterData.Equip)
        .then(() => {
          //console.log('Equip set',TRHMasterData.Equip)
          store.commit('loadData', {
            key: 'Equip',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'Equip',
            loaded: false
          })
        })
    }

    //Init Consumable Data
    static initConsumableMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.Consumable = _(TRHMasterData.masterData.ConsumableMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['consumableId'] = _.toInteger(arr[0])
          obj['baseId'] = _.toInteger(arr[1])
          obj['name'] = arr[2]
          //obj['full_description'] = arr[3]
		  //obj['desc'] = arr[4]
          obj['type'] = _.toInteger(arr[5])
		  //0=Does not effect swords, 1=Effects 1 sword, 2=Effects all in party
		  //obj['effRange'] = _.toInteger(arr[6])
		  //For recovery items 1=Fatigue, 2=Health, 3=EXP
		  //obj['recType'] = _.toInteger(arr[7])
		  //For items that have a numerical effect like multipliers, expansions, currency
          obj['value'] = _.toInteger(arr[8])
          obj['limitNum'] = _.toInteger(arr[9])
          //flg of available?
          //obj['flg'] = _.toInteger(arr[10)
          //abandoned but exist??
          //obj['unknown'] = _.toInteger(arr[11])
          return obj
        })
        .keyBy('consumableId')
        .value()
      return localforage.setItem('ConsumableMaster', TRHMasterData.Consumable)
        .then(() => {
          //console.log('Consumable set',TRHMasterData.Consumable)
          store.commit('loadData', {
            key: 'Consumable',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'Consumable',
            loaded: false
          })
        })
    }

    //Init Square Data
    static initFieldSquareMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.FieldSquare = _(TRHMasterData.masterData.FieldSquareMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['episodeId'] = _.toInteger(arr[0])
          obj['fieldId'] = _.toInteger(arr[1])
          obj['layerNum'] = _.toInteger(arr[2])
          obj['squareId'] = _.toInteger(arr[3])
          obj['category'] = _.toInteger(arr[4])
          obj['itemType'] = _.toInteger(arr[5])
          obj['itemId'] = _.toInteger(arr[6])
          obj['itemNum'] = _.toInteger(arr[7])
          obj['bgmId'] = _.toInteger(arr[8])
          return obj
        })
        .groupBy('episodeId')
        .mapValues((val) => {
          return _(val)
            .groupBy('fieldId')
            .mapValues((v) => {
              return _(v)
                .groupBy('layerNum')
                .mapValues((vv) =>{
                  return _(vv)
                    .keyBy('squareId')
                    .value()
                })
                .value()
            })
            .value()
        })
        .value()
      return localforage.setItem('FieldSquareMaster', TRHMasterData.FieldSquare)
        .then(() => {
          //console.log('FieldSquare set',TRHMasterData.FieldSquare)
          store.commit('loadData', {
            key: 'FieldSquare',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'FieldSquare',
            loaded: false
          })
        })
    }

    //Init Event Data
    static initEventMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.Event = _(TRHMasterData.masterData.EventMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['episodeId'] = _.toInteger(arr[0])*(-1)
          obj['name'] = arr[1]
          obj['type'] = _.toInteger(arr[3])
          return obj
        })
        .keyBy('episodeId')
        .value()
      return localforage.setItem('EventMaster', TRHMasterData.Event)
        .then(() => {
          //console.log('Event set',TRHMasterData.Event)
          store.commit('loadData', {
            key: 'Event',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'Event',
            loaded: false
          })
        })
    }

    //Init Event Layer Data
    static initEventLayerMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.EventLayer = _(TRHMasterData.masterData.EventLayerMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['episodeId'] = _.toInteger(arr[0])*(-1)
          obj['fieldId'] = _.toInteger(arr[1])
          obj['layerNum'] = _.toInteger(arr[2])
          obj['map'] = _.toInteger(arr[4])
          return obj
        })
        .groupBy('episodeId')
        .mapValues((val) => {
          return _(val)
            .groupBy('fieldId')
            .mapValues((v) => {
              return _(v)
                .keyBy('layerNum')
                .value()
            })
            .value()
        })
        .value()
      return localforage.setItem('EventLayerMaster', TRHMasterData.EventLayer)
        .then(() => {
          //console.log('EventLayer set',TRHMasterData.EventLayer)
          store.commit('loadData', {
            key: 'EventLayer',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'EventLayer',
            loaded: false
          })
        })
    }

    //Init Event Square Data
    static initEventSquareMaster (store) {
      if (TRHMasterData.masterData === null) return
      TRHMasterData.EventSquare = _(TRHMasterData.masterData.EventSquareMaster)
        .split('\n')
        .map((line) => {
          let arr = line.split(',')
          let obj = {}
          obj['episodeId'] = _.toInteger(arr[0])*(-1)
          obj['fieldId'] = _.toInteger(arr[1])
          obj['layerNum'] = _.toInteger(arr[2])
          obj['squareId'] = _.toInteger(arr[3])
          obj['category'] = _.toInteger(arr[4])
          obj['itemType'] = _.toInteger(arr[5])
          obj['itemId'] = _.toInteger(arr[6])
          obj['itemNum'] = _.toInteger(arr[7])
          obj['bgmId'] = _.toInteger(arr[8])
          return obj
        })
        .groupBy('episodeId')
        .mapValues((val) => {
          return _(val)
            .groupBy('fieldId')
            .mapValues((v) => {
              return _(v)
                .groupBy('layerNum')
                .mapValues((vv) =>{
                  return _(vv)
                    .keyBy('squareId')
                    .value()
                })
                .value()
            })
            .value()
        })
        .value()
      return localforage.setItem('EventSquareMaster', TRHMasterData.EventSquare)
        .then(() => {
          //console.log('EventSquare set',TRHMasterData.EventSquare)
          store.commit('loadData', {
            key: 'EventSquare',
            loaded: true
          })
        })
        .catch((err) => {
          console.log('err', err)
          store.commit('loadData', {
            key: 'EventSquare',
            loaded: false
          })
        })
    }
  }
})