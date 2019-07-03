define((require, exports, module) => {
  const store = require('app/data/index')
  const TRHMasterData = require('app/core/master')
  const TRH = require('app/core/const/index')

  exports.battleStatusText = Vue.filter('battle-status-text', function (statusId) {
    return ['Sortie', 'Minor', 'Moderate', 'Severe', 'Broken'][statusId]
  })

  exports.statusText = Vue.filter('status-text', function (statusId) {
    return ['-', 'Repair', 'Kiwame', 'Expedition', 'Sortie'][statusId]
  })

  exports.statusCname = Vue.filter('status-cname', function (statusId) {
    return ['normal', 'recovery', 'damaged', 'warning', 'danger'][statusId]
  })

  exports.fatigueCname =  Vue.filter('fatigue-cname', function (fatigueFlag) {
    return ['very-tired', 'tired', 'normal', 'perfect'][fatigueFlag]
  })

  exports.fatigueText = Vue.filter('fatigue-text', function (fatigueFlag) {
    return ['Exhausted', 'Tired', 'Normal', 'Sakura Fubuki'][fatigueFlag]
  })
  
  exports.equipNameFormat = Vue.filter('equip-name-format', (name) => {
	if (!name) {
		//For PVP list
		return
	}
    return name.replace('･特上', '').replace('･上', '').replace('･並', '').replace(/\d+/, '')
  })

  exports.fatigueBuff = Vue.filter('fatigue-buff', function (fatigueFlag) {
    return '(' + ['-40%', '-20%', '+0%', '+20%'][fatigueFlag] + ')'
  })
  
  //Replaces Sword type kanji with type icon
  exports.typePattern = Vue.filter('type-pattern', function (typeName, rarity) {
	return typeName ? '../../static/sword/ico/' + typeName + '-' + rarity + '.png' : '../../static/sword/0.png'
  })

  exports.swordPattern = Vue.filter('sword-pattern', function (swordId) {
    return swordId ? '../../static/sword/' + swordId + '.png' : '../../static/sword/0.png'
  })
  
  //Replaces Evolution Upgrade unicode symbol with kiwame/toku symbols
  exports.evolutionPattern = Vue.filter('evolution-pattern', function (symbolID) {
	let evoName = ['normal', 'toku', 'kiwame']
	return symbolID ? '../../static/sword/ico/' + evoName[symbolID] + '-' + symbolID + '.png' : '../../static/sword/ico/' + evoName[symbolID] + '-' + symbolID + '.png'
  })
  
  //Replaces Omamori with icon
  exports.amuletPattern = Vue.filter('amulet-pattern', function (itemName) {
	console.log(itemName)
	return itemName != "-" ? '../../static/sword/ico/' + itemName.replace('・','-') + '.png' : "-"
  })

  exports.EnemySwordPattern = Vue.filter('enemy-sword-pattern', function (swordId) {
    let imageId = _.get(TRHMasterData.getMasterData('Sword'), [swordId, 'imageId'], 0)
    let rarity = _.get(TRHMasterData.getMasterData('Sword'), [swordId, 'rarity'], 0)
    return swordId ? '../../static/enemy/' + imageId + '_' + rarity + '.png' : '../../static/sword/0.png'
  })

  exports.MapPattern = Vue.filter('map-pattern', function (mapId) {
    let [episodeId , fieldId , layerNum] = mapId.split('_')
    if(episodeId > 0)
      return '../../static/map/' + episodeId + '_' + fieldId + '_' + layerNum + '.jpg'
    else if (episodeId < 0){
      let type = _.get(TRHMasterData.getMasterData('Event'), [episodeId, 'type'], 0)
      let map = _.get(TRHMasterData.getMasterData('EventLayer'), [episodeId, fieldId, layerNum, 'map'], 0)
	  
	  //console.log(TRHMasterData.getMasterData('Event'))
      if(type == 4){
		//Regiment Maps
        map = fieldId
      };
	  if (type == 8 || type == 9) {
		//Special Investigation Maps
		if(layerNum == 2){
			return '../../static/map/event' +  '_' + type + '.jpg'
		}
		//console.log(TRHMasterData.getMasterData('Event')[episodeId]['type'])
		
		const evsq = TRHMasterData.getMasterData('EventSquare')
		let evsql = evsq[episodeId][map][layerNum]
		let vers = 1
		let test = 0
		for (i=48; i < Object.entries(evsq).length+48; i++) {
			if (type == TRHMasterData.getMasterData('Event')[-i]['type']) {
				let evsqL = evsq[-i][map][layerNum]
				//for (a=1)
				console.log(-i,Object.keys(evsqL).length)
				if (evsqL['category'] !== evsql['category'] || evsqL['squareId'] !== evsql['squareId']) {
					//Checks to see if maps are diff, if yes 'updates' version number
					vers++
				}
				else {
					continue
				}
			}
		}
		console.log(vers)
		
		if (map = 2) {
			const ev = Object.values(TRHMasterData.getMasterData('Event'))
			let vers = 0;
			for (const v of ev) {
				if (v['type'] == type) {
					vers++
				}
			}
			return '../../static/map/event' +  '_' + type + '_' + map + '_' + vers + '.jpg'
		}
	  }
	  return '../../static/map/event' +  '_' + type + '_' + map + '.jpg'
    }
  })

  exports.swordObject = Vue.filter('sword-object', function (serialId) {
    return serialId
  })

  exports.partyStatus = Vue.filter('party-status', (status) => {
    return [
      'locked',
      'normal',
      'conquest',
      'inBattle'
    ][status] || ''
  })

  exports.amuletName = Vue.filter('amulet-name', (itemId) => {
    return [
    '-',
    'Omamori',
    'Omamori・極'
    ][itemId] || ''
  })

  exports.getNotFlg = Vue.filter('not-flg', (flg) =>{
    return ['○', ''][flg]
  })

  exports.hhmmss = Vue.filter('hhmmss', (time) => {
    return moment(time).format('HH:mm:ss')
  })

  exports.MMDDhhmmss = Vue.filter('MMDDhhmmss', (time) => {
    return moment(time).format('MM/DD HH:mm:ss')
  })

  exports.equipLevelName = Vue.filter('equip-level-name', function (equip_id) {
    let level = _.get(TRHMasterData.getMasterData('Equip'), [equip_id, 'rarity'], 0)
    return {
      0: 'destroyed',
      1: 'n',
      3: 'r',
      5: 'sr'
    }[level]
  })

  exports.equipLevelCname = Vue.filter('equip-level-cname', function (level) {
    return {
      0: 'destroyed',
      1: 'n',
      3: 'r',
      5: 'sr'
    }[level]
  })

  exports.rankName = Vue.filter('rank-name', (rank) => {
    return [
      '-',
      'Duel',
      'S',
      'A',
      'B',
      'C',
      'Fail'
    ][rank] || ''
  })

  exports.formationName = Vue.filter('formation-name', (formationId) => {
    return {
      0: 'Unknown',
      1: 'Fish Scale',
      2: 'Crane Wings',
      3: 'Square',
      4: 'Horizontal',
      5: 'Echelon',
      6: 'Reversed'
    }[formationId] || ''
  })

  exports.swordName = Vue.filter('sword-name', (swordId) => {
	//console.log(swordId,_.get(TRHMasterData.getMasterData('Sword'), [swordId, 'name'], '-'))
	return swordId ? _.get(TRHMasterData.getMasterData('Sword'), [swordId, 'name'], '-') : '空'
  })

  exports.swordHp = Vue.filter('sword-hp', (swordId) => {
    return swordId ? _.get(TRHMasterData.getMasterData('Sword'), [swordId, 'hp'], '-') : '0'
  })

  exports.equipName = Vue.filter('equip-name', (equipId) => {
    return equipId ? _.get(TRHMasterData.getMasterData('Equip'), [equipId, 'name'], '-') : '空'
  })

  exports.swordSerialName = Vue.filter('sword-serial-name', (serialId) => {
    return _.get(store.state, ['swords', 'serial', serialId, 'name'], '-')
  })

  exports.equipSerialName = Vue.filter('equip-serial-name', (serialId) => {
    return _.get(store.state, ['equip', 'serial', serialId, 'name'], '-')
  })

  exports.PracticeEnemyEquipName = Vue.filter('practice-enemy-equip-serial-name', (serialId) => {
    return _.get(store.state, ['practice_enemy', 'enemy_equip', serialId, 'name'], '-')
  })

  exports.allEquipSerialName = Vue.filter('all-equip-serial-name', (serialIds) => {
	serialArr = _.map(serialIds, function (serialId) {
		let names = _.get(store.state, ['equip', 'serial', serialId, 'name'], '-')
		let typeId = (_.find(TRHMasterData.getMasterData('Equip'), ['name', names]) ? _.find((TRHMasterData.getMasterData('Equip')), ['name', names])['type'] : 0 )
		let equipId = (_.find(TRHMasterData.getMasterData('Equip'), ['name', names]) ? _.find((TRHMasterData.getMasterData('Equip')), ['name', names])['equipId'] : 0 )
		if (names.indexOf('･') > -1) {
			return TRH.EquipENGName[String(equipId)]
		}
		if (typeId == 0) {
			return '-'
		}
	})
    return serialArr.join(' / ')
  })

  exports.itemNameFormat = Vue.filter('item-name-format', (ConsumableId) => {
    let name = _.get(TRHMasterData.getMasterData('Consumable'), [ConsumableId, 'name'], '-')
    //return name.replace('御札・', '')
	return name
  })
  
  // Translation filters
  exports.convertTeamName = Vue.filter('convert-team-name', (team) => {
	return _.get(store.state, ['party', 'parties', team, 'party_name'], '-').replace('第','Team ').replace('部隊','')
  })
  
  exports.convertSwordNo = Vue.filter('convert-sword-no', (swordID) => { 
	let name = TRH.SwordENGName[swordID][swordID] + (_.get(TRHMasterData.getMasterData('Sword'), [swordID, 'symbol'], 0) === 2 ? '·🌸' : '')
	return (swordID ? name : '空')
  })
  
  exports.convertSwordSerial = Vue.filter('convert-sword-serial', (swordSerialID) => {
	let swordID = String(_.get(store.state, ['swords', 'serial', swordSerialID, 'sword_id'], 0))
	let name = (swordID>0 ? TRH.SwordENGName[swordID][swordID] + (_.get(TRHMasterData.getMasterData('Sword'), [swordID, 'symbol'], 0) === 2 ? '·🌸' : '') : "")
	return (swordID ? name : '空')
  })
  
  exports.convertSwordName = Vue.filter('convert-sword-name', (SName) => {
	if (SName=="") {
		//No Horse Equipped to sword
		return "-"
	}
	if (SName=="None") {
		return SName
	}
	let swordID = (_.find(TRHMasterData.getMasterData('Sword'), ['name', SName.replace('·🌸','')]) ? _.find((TRHMasterData.getMasterData('Sword')), ['name', SName.replace('·🌸','')])['swordId'] : 0 )
	//The _.find() method will only return the first occuring name (ie non-kiwame/pre-toku).
	if (SName.indexOf('·🌸')>-1) {
		swordID += 1
	}
	let name = (swordID ? TRH.SwordENGName[String(swordID)][String(swordID)] + (_.get(TRHMasterData.getMasterData('Sword'), [swordID, 'symbol'], 0) === 2 ? '·🌸' : '') : '')
	return (swordID ? name : '空')
  })
  
  exports.convertEquipName = Vue.filter('convert-equip-name', (EName) => {
	if (!EName) {
		//For PVP
		return
	}
	if (_.find(TRHMasterData.getMasterData('Equip'), ['description', EName])) {
		// Troops Equipped
		let typeID = (_.find(TRHMasterData.getMasterData('Equip'), ['description', EName]) ? _.find((TRHMasterData.getMasterData('Equip')), ['description', EName])['type'] : 0 )
		return (typeID ? TRH.EquipENGType[String(typeID)] : '空')
	}
	else {
		let typeId = (_.find(TRHMasterData.getMasterData('Equip'), ['name', EName]) ? _.find((TRHMasterData.getMasterData('Equip')), ['name', EName])['type'] : 0 )
		let equipID = (_.find(TRHMasterData.getMasterData('Equip'), ['name', EName]) ? _.find((TRHMasterData.getMasterData('Equip')), ['name', EName])['equipId'] : 0 )
		// Horses Inventory
		if (typeId == 100) {
			return TRH.EquipENGName[String(equipID)]
		}
		//Troops Inventory
		if (EName.indexOf('･') > -1) {
			return TRH.EquipENGName[String(equipID)]
		}
		// NO equipped horses in Sword List
		if (!typeId) {
			return '-'
		}
	}
  })
  
  exports.convertItemName = Vue.filter('convert-item-name', (item) => {
	let itemID = (_.find(TRHMasterData.getMasterData('Consumable'), ['name', item]) ? _.find((TRHMasterData.getMasterData('Consumable')), ['name', item])['consumableId'] : 0 )
	return TRH.ItemENGName[String(itemID)]
  })
})