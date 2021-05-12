define((require, exports, module) => {
  const store = require('app/data/index')
  const TRHMasterData = require('app/core/master')
  const TRH = require('app/core/const/index')
  return class TRHRequestRouter {
    static route (action, content) {
      // Log
      // Route
      if (_.isFunction(this[action])) {
        this[action](content)
      }
      // Common
      this.common(action, content)
    }
    static updatePartyBattleStatus (partyNo, inBattle) {

    }

    static common (action, content) { 
      if (content.sword) {
        if (!content.sword.serial_id) {
          _.each(content.sword, (v, k) => {
			if (v.serial_id) {
			  v.inBattle = false
			  if (v.battleStatus) {
			    v.status = v.battleStatus
                delete v.battleStatus
			  }
			  store.commit('swords/updateSword', {
				serialId: k,
				updateData: v
			  })
			  store.commit('swords/updateSword', {
				serialId: k,
				updateData: {home_hp: v.hp}
			  })
			}
          })
		}
      }
      if (content.resource) {
        store.commit('resource/updateResource', {
          updateData: content.resource
        })
      }
      if (content.currency) {
        store.commit('resource/updateResource', {
          updateData: content.currency
        })
      } else if (content.money) {
        store.commit('resource/updateResource', {
          updateData: _.pick(content, ['money'])
        })
      }
      if (content.party) {
		if (action != 'party/partydissolution' && action != 'party/change_battle_party') {
		  _.each(_.pick(content.party, [1, 2, 3, 4]), (v, k) => {
			store.commit('party/updateParty', {
              partyNo: k,
              updateData: v
			})
          })
		}
      }
      if (content.player) {
        store.commit('player/updatePlayer', {
          updateData: content.player
        })
      }
      if (content.repair) {
        _.each(content.repair, (v, k) => {
          store.commit('repair/updateRepair', {
            slotNo: k,
            updateData: v
          })
        })
      }
      if (content.forge) {
        _.each(content.forge, (v, k) => {
          store.commit('forge/updateForge', {
            slotNo: k,
            updateData: v
          })
        })
      }
      if (content.duty) {
        store.commit('duty/updateDuty', {
          updateData: content.duty
        })
      }
	  if (content.evolution) {
		if (Object.keys(content.evolution).length > 0) {
			let EvoCont = content.evolution.back
			store.commit('evolution/updateEvolution', {
				updateData: {back: {0: {serial_id: EvoCont.serial_id, finished_at: EvoCont.finished_at}}}
			})
		}
	  }
      if (content.equip) {
        _.each(content.equip, (v, k) => {
          if (!v.serial_id) return
          store.commit('equip/updateEquip', {
            serialId: v.serial_id,
            updateData: v
          })
        })
      }
	  if (content.season_reward) {
		let rss = content.season_reward
		if (Object.keys(rss).length) {
			_.each(rss, (v, k) => {
				store.commit('item/addItem', {
					consumableId: v.item_id, 
					updateData: {
					  consumable_id:  v.item_id,
					  num:  v.item_num
					}
				})
			})
		}
	  }
      if (content.item_list) {
        _.each(content.item_list, (v, k) => {
          store.commit('item/updateItem', {
            consumableId: v.consumable_id,
            updateData: v
          })
        })
      } else if(content.item) {
        _.each(content.item, (v, k) => {
          store.commit('item/updateItem', {
            consumableId: v.consumable_id,
            updateData: v
          })
        })
      }
    }
    static ['party/list'](content){
      store.commit('swords/clear')
      store.commit('equip/clear')
      //store.commit('item/clear')
    }

    static ['shop/list'](content){
      store.commit('item/clear')
    }

    static ['item/add_exp'](content){
      store.commit('swords/updateSword',{
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['forge'](content){
      store.commit('forge/clear')
    }

    static ['repair'](content){
      store.commit('repair/clear')
    }

    static ['practice/offer'](content){
	  //console.log(content.postData['num'],content)
	  let num_id = content.postData['num']
      _.each(content.enemy_equip, (v,k) => {
        store.commit('practice_enemy/updatePracticeEquip', {
		  numId: num_id,
		  serialId: k, 
          updateData: v
        })
      })
      _.each(content.enemy_sword, (v,k) => {
        store.commit('practice_enemy/updatePracticeSword', {
          numId: num_id,
		  serialId: k, 
          updateData: v
        })
        store.commit('practice_enemy/updatePracticeSword', {
		  numId: num_id,
		  serialId: k,
          updateData: {isEnemy: true}
        })
      })
      _.each(content.enemy_party, (v,k) => {
        store.commit('practice_enemy/updatePracticeParty', {
		  numId: num_id,
		  partyNo: k, 
          updateData: v
        })
      })
    }

    static ['battle/practicescout'](content){
      store.commit('inBattle')
      store.commit('fatigueToV')
      store.commit('sally/updateSally', {
        updateData: content.postData
      })
      let party = _.get(store, ['state', 'party', 'parties', content.postData.party_no], {})
      _.each(party.slot, (v, k)=>{
        if(v.serial_id)
        store.commit('swords/updateSword', {
          serialId: v.serial_id, 
          updateData: {inBattle: true}
        })
      })
      _.each(store.state.equip.serial, (v, k) => {
        store.commit('equip/updateEquip', {
          serialId: v.serial_id, 
          updateData: {soldier: v.hp_max}
        })
      })
    }

    static ['battle/practicebattle'](content){
      store.commit('inBattle')
      store.commit('battle/updateBattleResult', {
        updateData: content.result
      })
      store.commit('battle/updateBattlePlayer', {
        updateData: content.player
      })
      store.commit('player/updatePlayer', {
        updateData: content.player
      })
      store.commit('battle/updatePracticeBattle', {
        updateData: content
      })
	  store.commit('sally/updateSally', {
		  updateData: {koban_event_sally: false}
		})
      _.each(_.values(_.get(content, ['result', 'player', 'party', 'slot'])), (v, k) => {
        v.inBattle = true
        if (v.status) {
          v.battleStatus = v.status
          delete v.status
        }
        v.battleFatigue = _.get(store, ['state', 'swords', 'serial', v.serial_id, 'vfatigue'])
        let rank = _.get(content, ['result', 'rank'])
        let mvp = _.get(content, ['result', 'mvp'])
        let leader = _.get(content, ['result', 'player', 'party', 'slot', '1', 'serial_id'])
        if(rank < 6){
          // console.log("Rank Win")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          if(v.serial_id == mvp) {
            // console.log("mvp calculate")
            v.battleFatigue += 10
          }
        }
        if(v.battleFatigue >= 100) {
          // console.log(">= 100")
          v.battleFatigue = 100
        }
        store.commit('swords/updateSword', {
          serialId: v.serial_id,
          updateData: v
        })
      })
      _.each(_.values(_.get(content, ['battle'])), (v, k) =>{
        if(v.is_skill == true){
          v.battleFatigue = _.get(store, ['state', 'swords', 'serial', v.atk, 'battleFatigue'])
          v.battleFatigue -= 20
          store.commit('swords/updateSword', {
            serialId: v.atk,
            updateData: {battleFatigue : v.battleFatigue}
          })
        }
      })
      _.each(_.values(_.get(content, ['player', 'party'])), (v, k) => {
        let equipUpdate = [{
          serial_id: v.equip_serial_id1,
          soldier: v.soldier1
        }, {
          serial_id: v.equip_serial_id2,
          soldier: v.soldier2
        }, {
          serial_id: v.equip_serial_id3,
          soldier: v.soldier3
        }]
        _.each(_.filter(equipUpdate, o => !isNaN(o.serial_id)), (v) => {
          store.commit('equip/updateEquip', {
            serialId: v.serial_id,
            updateData: v
          })
        })
      })
    }

    static ['battle/alloutbattle'](content){
      let new_square_id = _.get(store, ['state', 'sally', 'square_id']) + 1
        store.commit('sally/updateSally', {
        updateData: {
          square_id: new_square_id,
          party_no: content.postData.party_no
        }
      })
      this['battle/battle'] (content)
      if(content.allout.is_finish == true){
        store.commit('player/updatePlayer', {
          updateData: {
            exp: content.allout.settle_up.player.exp,
            level: content.allout.settle_up.player.level
          }
        })
        _.each(content.allout.settle_up.player.party, (v, k)=>{
          _.each(v.slot, (v1, k1)=>{
            if(v1.serial_id){
              store.commit('swords/updateSword',{
                serialId: v1.serial_id,
                updateData: {
                  exp: v1.exp,
                  level: v1.level
                }
              })
            }
          })
        })
      }
    }

    static ['battle/battle'] (content) {
      store.commit('inBattle')
      store.commit('battle/updateBattleResult', {
        updateData: content.result
      })
      store.commit('battle/updateBattlePlayer', {
        updateData: content.player
      })
      store.commit('player/updatePlayer', {
        updateData: content.player
      })
      store.commit('battle/updateBattleEnemy', {
        updateData: content.enemy
      })
      store.commit('battle/updateBattle', {
        updateData: content
      })
	  let totlvl = 0
	  let count = 0
      _.each(_.get(content, ['result', 'player', 'party', 'slot']), (v, k) => {
		count++
		totlvl += parseInt(v.level)
        v.inBattle = true
        if (v.status) {
          v.battleStatus = v.status
          delete v.status
        }

		//Here lies fatigue/battleFatigue issue
		v.battleFatigue = _.get(store, ['state', 'swords', 'serial', v.serial_id, 'battleFatigue'])
        let rank = _.get(content, ['result', 'rank'])
        let mvp = _.get(content, ['result', 'mvp'])
        let leader = _.get(content, ['result', 'player', 'party', 'slot', '1', 'serial_id'])
        if(content.tsukimi){
          if(JSON.stringify(content.tsukimi)!="{}"){
            v.battleFatigue += -6
          }
        }
        if(rank == 1) {
          // console.log("Rank ONE_ON_ONE")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          v.battleFatigue += 1
        }
        else if(rank == 2) {
          // console.log("Rank S")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          v.battleFatigue += 1
        }
        else if(rank == 3) {
          // console.log("Rank A")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          v.battleFatigue += 0
        }
        else if(rank == 4) {
          // console.log("Rank B")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          v.battleFatigue -= 1
        }
        else if(rank == 5) {
          // console.log("Rank C")
          if(v.serial_id == leader) {
            // console.log("leader calculate")
            v.battleFatigue += 3
          }
          v.battleFatigue -= 2
        }
        else if(rank == 6) {
          // console.log("Rank D")
          v.battleFatigue -= 3
        }
        if(v.serial_id == mvp) {
          // console.log("mvp calculate")
          v.battleFatigue += 10
        }
        if(v.battleFatigue >= 100) {
          // console.log(">= 100")
          v.battleFatigue = 100
        }
        if(v.battleFatigue <= 0) {
          // console.log("<= 0")
          v.battleFatigue = 0
        }
        store.commit('swords/updateSword', {
          serialId: v.serial_id,
          updateData: v
        })
      })
	  
	  _.each(_.values(_.get(content, ['battle'])), (v, k) =>{
        if(v.is_skill == true){
          v.battleFatigue = _.get(store, ['state', 'swords', 'serial', v.atk, 'battleFatigue'])
          v.battleFatigue -= 20
          store.commit('swords/updateSword', {
            serialId: v.atk,
            updateData: {battleFatigue: v.battleFatigue}
          })
        }
      })
	  
	  this['sally/homereturn'] (content)
	  
      _.each(_.values(_.get(content, ['player', 'party'])), (v, k) => {
        let equipUpdate = [{
          serial_id: v.equip_serial_id1,
          soldier: v.soldier1
        }, {
          serial_id: v.equip_serial_id2,
          soldier: v.soldier2
        }, {
          serial_id: v.equip_serial_id3,
          soldier: v.soldier3
        }]
        _.each(_.filter(equipUpdate, o => !isNaN(o.serial_id)), (v) => {
          store.commit('equip/updateEquip', {
            serialId: v.serial_id,
            updateData: v
          })
        })
      })
	  
	  //Auto-update Average/Total Levels right as battle begins for more informed advancing during sorties
	  if (_.get(store, ['state', 'sally', 'episode_id']) > 0) {
		let avglvl = Math.ceil(totlvl/count)
		store.commit('party/updateLevel', {
			partyNo: content.result.player.party.party_no,
			totalLevel: totlvl,
			averageLevel: avglvl
		})
	  }
	  
	  /*if (content.finished.is_finish && (_.get(store, ['state', 'sally', 'koban_event_sally'], false)) {
		store.commit('party/updateParty', {
		  partyNo: content.result.player.party.party_no,
		  updateData: {inBattle: false, party_name: content.result.player.party.party_name}
		})
		_.each(content.result.player.party.slot, (j, i) => {
			if (j.serial_id) {
			  let swordSR = _.get(store.state, ['swords', 'serial', j.serial_id], {})
			  store.commit('swords/updateSword', {
				serialId: j.serial_id,
				updateData: {hp: swordSR.home_hp}
			  })
			  store.commit('swords/updateSword', {
				serialId: j.serial_id,
				updateData: {inBattle: false}
			  })
			}
		})
	  }*/
    }

    static ['home'] (content) {
	  store.commit('notInBattle')
	  store.commit('swords/deleteSword', {
        serialId: 0
      })
	  store.commit('equip/deleteEquip', {
		serialId: 0
	  })
	  store.commit('party/deleteParty', {
		partyNo: 0
	  })
	  store.commit('sally/updateSally', {
		updateData: {check: false}
	  })
	  //Let's you know there is a new sword in album you have not checked yet
	  let album = content.album
	  
	  _.each(_.pick(content.party, [1, 2, 3, 4]), (v, k) => {
		store.commit('party/updateParty', {
		  partyNo: v.party_no,
		  updateData: {inBattle: false, party_name: v.party_name}
		})
		_.each(v.slot, (j, i) => {
			if (j.serial_id) {
			  let swordSR = _.get(store.state, ['swords', 'serial', j.serial_id], {})
			  store.commit('swords/updateSword', {
				serialId: j.serial_id,
				updateData: {hp: swordSR.home_hp}
			  })
			  store.commit('swords/updateSword', {
				serialId: j.serial_id,
				updateData: {inBattle: false}
			  })
			  let equipUpdate = [{
				  serial_id: swordSR.equip_serial_id1,
				  soldier: null
				}, {
				  serial_id: swordSR.equip_serial_id2,
				  soldier: null
				}, {
				  serial_id: swordSR.equip_serial_id3,
				  soldier: null
				}]
			  _.each(_.filter(equipUpdate, o => !isNaN(o.serial_id) && o.serial_id), (r) => {
				let equip = _.get(store, ['state', 'equip', 'serial', r.serial_id], {})
				if (_.get(store, ['state', 'sally', 'koban_event_sally'], false) || equip.soldier > 0 || equip.soldier > 0) {
					r.soldier = equip.hp_max
				}
				else {
					r.serial_id = 0
					r.soldier = 0
				}
				store.commit('equip/updateEquip', {
				  serialId: r.serial_id,
				  updateData: r
				})
			  })
			}
		})
	  })
    }
	
	static ['home/leave'] (content) {
		let EvoCont = content.evolution.back
		store.commit('evolution/updateEvolution', {
			updateData: {back: {0: {serial_id: EvoCont.serial_id, finished_at: EvoCont.finished_at}}}
		})
	}
	
	static ['home/back'] (content) {
		//Called when sword returns from Kiwame
	}
    
	//Fatigue values were appearing at ~10 higher than actual values.
	//To fix this had to set battleFatigue and fatigue equal and manually set recover date.
    static ['sally/homereturn'] (content) {
	  if (content.result) {
		_.each(_.values(_.get(content, ['result', 'player', 'party', 'slot'])), (v, k) => {
			store.commit('swords/updateSword', {
			  serialId: v.serial_id,
			  updateData: {recovered_at: Date.now()}
			})
		})
	  }
	  _.each(_.values(_.get(store.state, ['battle', 'result', 'player', 'party', 'slot'])), (v, k) => {
	    store.commit('swords/updateSword', {
		  serialId: v.serial_id,
		  updateData: {recovered_at: Date.now()}
		})
	  })
	}
	
	static ['sally'] (content) {
	  _.each(_.pick(content.party, [1, 2, 3, 4]), (v, k) => {
		_.each(v.slot, (j, i) => {
			if (j.serial_id) {
				let swordSR = content.sword[j.serial_id]
				store.commit('swords/updateSword', {
					serialId: j.serial_id,
					updateData: {home_hp: swordSR.hp}
				})
				console.log(_.get(store, ['state', 'swords', 'serial', j.serial_id, 'home_hp']))
			}
		})
	  })
	}
	
	static ['sally/sally'] (content) {
	  let party = _.get(store, ['state', 'party', 'parties', content.postData.party_no], {})
	  store.commit('inBattle')
	  console.log(_.get(store, ['state', 'sally', 'check']))
	  
	  if (!_.get(store, ['state', 'sally', 'check'])) {
		store.commit('fatigueToVV')
		store.commit('sally/updateSally', {
          updateData: {square_id: "1"}
		})
		store.commit('sally/updateSally', {
		  updateData: {koban_event_sally: false}
		})
		console.log('koban_event_sally',_.get(store, ['state', 'sally']))
		store.commit('sally/updateSally', {
		  updateData: {check: true}
		})
		_.each(party.slot, (v, k)=>{
          if(v.serial_id) {
			store.commit('swords/updateSword', {
			  serialId: v.serial_id, 
			  updateData: {inBattle: true}
			})
		  }
		})
		store.commit('sally/updateSally', {
          updateData: content.postData
		})

		store.commit('sally/updateSally', {
          updateData: content
		})
		store.commit('party/updateParty', {
		  partyNo: party.party_no,
		  updateData: {inBattle: true, party_name: '第' + party.party_no + '部隊'}
		})
	  }
    }
	
    static ['sally/eventsally'] (content) {
	  let evcont = content.postData
	  console.log(content,evcont);
	  let EID = 0
	  if (evcont.event_id!= null) {
		EID = parseInt('-' + evcont.event_id)
	  }

	  store.commit('event/updateEventID', {
		event_id: EID
	  })

	  let event_info = {
		episodeId: EID ? EID : null,
		name: _.get(TRHMasterData.getMasterData('Event'), [EID, 'name'], null),
		type: _.get(TRHMasterData.getMasterData('Event'), [EID, 'type'], null)
	  }
	  store.commit('event/updateEventType', {
		updateData: event_info
	  })
      let eventContent = {
        episode_id: EID,
        field_id: evcont.event_field_id,
		square_id: 1,
        layer_num: content.select_event_layer_num ? content.select_event_layer_num : 1
      }
      let eventType = _.get(TRHMasterData.getMasterData('Event'), [EID, 'type'], 0)

	  //These maps have other layers
      if(eventType==6 || eventType==8 || eventType==9){
        eventContent.layer_num = content.select_event_layer_num
      }
      store.commit('sally/updateSally', {
        updateData: eventContent
      })
	  
      //Runs 'sally/sally' router for battle related updates (i.e. fatigue or equips)
	  this['sally/sally'] (content)
      if(eventType==4){
        store.commit('sally/updateSally', {
          updateData: {square_id: "0"}
        })
      }
	  else {
		store.commit('sally/updateSally', {
          updateData: {square_id: "1"}
        })
	  }
	  let type = _.get(store, ['state', 'event', 'event_info', 'type'], 0)
	  if (type == 3 || type == 4 || type == 5) {
		store.commit('sally/updateSally', {
			updateData: {koban_event_sally: true}
		})
		console.log('koban_event_sally',_.get(store, ['state', 'sally']))
	  }
    }
	
    static ['sally/forward'] (content) {
      store.commit('sally/updateSally', {
        updateData: _.pick(content, ['square_id'])
      })
      store.commit('battle/clearBattleScout')
      store.commit('battle/updateBattleScout', {
        updateData: content.scout
      })
      store.commit('battle/clearBattleEnemy')
	  
	  if (content.reward) {
		let rss = content.reward
		if (Object.keys(rss).length) {
			_.each(rss, (v, k) => {
				store.commit('item/addItem', {
					consumableId: v.item_id, 
					updateData: {
					  consumable_id:  v.item_id,
					  num:  v.item_num
					}
				})
			})
		}
	  }
	  let type = _.get(store, ['state', 'event', 'event_info', 'type'], 0)
	  if (type==0) {
		if (content.powerful.is_appear) {
			console.log('Kebiishi')
		}
	  }
	  
	  if (_.get(store, ['state', 'sally', 'episode_id'], 0) > 0) {
		this['sally/sally'] (content)
	  }
    }
	
    static ['sally/eventforward'] (content) {
	  let event = content.postData
	  console.log(event);
	  //let new_layer_num = content.research.warp.layer_id
	  store.commit('sally/updateSally', {
		updateData: {square_id: content.square_id}
	  })
	  
	  Object.keys(content).forEach(k => {
		if (k=="gimmick") {
			if(content.gimmick.draw){
				//Poison Arrows
				if(content.gimmick.draw==19 || (content.gimmick.draw>=53 && content.gimmick.draw<=55)){
				  _.each(content.gimmick.result.effect, (v, k)=>{
					store.commit('swords/updateSword',{
					  serialId: v.serial_id,
					  updateData: {hp: v.value[1] || 1}
					})
				  })
				}
				//Bombs
				else if(content.gimmick.draw==20 || (content.gimmick.draw>=60 && content.gimmick.draw<=62)){
				  _.each(content.gimmick.result.serial_ids, (v, k)=>{
					store.commit('equip/updateEquip',{
					  serialId: v,
					  updateData: {soldier: '0'}
					})
				  })
				}
			}
		}})
	  //runs sally/forward for Scouting and Node selection
	  this['sally/forward'] (content)
    }
	
    static ['forge/start'] (content) {
      store.commit('forge/updateForge', {
        slotNo: content.slot_no,
        updateData: _.extend(content, content.postData)
      })
    }

    static ['forge/fast'] (content) {
      let forgeData = _.get(store, ['state', 'forge', 'slot', content.postData.slot_no], {})
      
      store.commit('forge/updateForge', {
        slotNo: content.postData.slot_no,
        updateData: {
          slot_no: content.postData.slot_no,
          sword_id: content.sword_id,
          finished_at: forgeData.finished_at
        }
      })
      store.commit('item/addItem', {
        consumableId: 8, 
        updateData: {
          consumable_id: 8,
          num: -1
        }
      })
    }

	static ['repair/fast'] (content) {
	  let repairData = _.get(store, ['state', 'repair', 'slot', content.postData.slot_no], {})
      
      store.commit('repair/updateRepair', {
        slotNo: content.postData.slot_no,
        updateData: {
          slot_no: content.postData.slot_no,
          sword_serial_id: repairData.sword_serial_id,
          finished_at: repairData.finished_at
        }
      })
      store.commit('item/addItem', {
        consumableId: 8, 
        updateData: {
          consumable_id: 8,
          num: -1
        }
      })
	}
	
    static ['login/start'] (content) {
      store.commit('player/updatePlayer', {
        updateData: _.pick(content, ['name', 'level'])
      })
	  let EID = 0
	  if (content.event_id) {
		EID = content.event_id*(-1)
	  }
	  store.commit('event/updateEventID', {
		event_id: EID
	  })
	  
	  let event_info = {
		episodeId: EID ? EID : 0,
		name: _.get(TRHMasterData.getMasterData('Event'), [EID, 'name'], ' '),
		type: _.get(TRHMasterData.getMasterData('Event'), [EID, 'type'], 0)
	  }
	  store.commit('event/updateEventType', {
		updateData: event_info
	  })
	  
	  let EvoCont = content.evolution.back
	  store.commit('evolution/updateEvolution', {
		updateData: {back: {0: {serial_id: EvoCont.serial_id, finished_at: EvoCont.finished_at}}}
	  })
	  _.each(_.pick(content.party, [1, 2, 3, 4]), (v, k) => {
		_.each(v.slot, (j, i) => {
		  if (j.serial_id) {
			console.log(_.get(store, ['state', 'swords', 'serial', j.serial_id, 'hp']))
			store.commit('swords/updateSword', {
			  serialId: j.serial_id,
			  updateData: {home_hp: _.get(store, ['state', 'swords', 'serial', j.serial_id, 'hp'])}
			})
		  }
		})
      })
	}

    static ['equip/setequip'] (content) {
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['equip/removeequip'] (content) {
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['equip/removeall'] (content) {
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['equip/setitem'] (content) {
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['equip/removeitem'] (content) {
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id,
        updateData: content.sword
      })
    }

    static ['party/setsword'] (content) {
      _.each(_.pick(content, [1, 2, 3, 4]), (v, k) => {
        store.commit('party/updateParty', {
          partyNo: k,
          updateData: v
        })
      })
    }

    static ['party/removesword'] (content) {
      _.each(_.pick(content, [1, 2, 3, 4]), (v, k) => {
        store.commit('party/updateParty', {
          partyNo: k,
          updateData: v
        })
      })
    }
	
	static ['party/partydissolution'] (content) {
      _.each(_.pick(content.party, content.postData.party_no), (v, k) => {
        store.commit('party/updateParty', {
          partyNo: k,
          updateData: v
        })
      })
    }

    static ['user/profile'] (content) {
      store.commit('player/updatePlayer', {
          updateData: content
        })
    }

    static ['album/list'] (content) {
      _.each(content.sword, (v, k)=>{
        store.commit('album/updateAlbum', {
          swordId: v.sword_id,
          updateData: v
        })
      })
    }

    static ['conquest/complete'](content) {
      store.commit('player/updatePlayer', {
        updateData: content.result
      })
	  
	  if (content.reward) {
		let rss = content.reward
		if (Object.keys(rss).length) {
			_.each(rss, (v, k) => {
				store.commit('item/addItem', {
					consumableId: v.item_id, 
					updateData: {
					  consumable_id:  v.item_id,
					  num:  v.item_num
					}
				})
			})
		}
	  }
    }

    static ['party/partyreplacement'](content){
      _.each(_.pick(content, [1, 2, 3, 4]), (v, k) => {
        store.commit('party/updateParty', {
          partyNo: k,
          updateData: v
        })
      })
    }

    static ['produce/start'](content){
      if(content.success == 1)
      store.commit('equip/updateEquip', {
        serialId: content.serial_id,
        updateData: content
      })
    }

    static ['produce'](content){
      store.commit('equip/clear')
    }

    static ['sally/eventresume'](content){
      let eventContent = {
        episode_id: content.event_id*(-1),
        field_id: content.field_id,
        layer_num: content.layer_num
      }
      store.commit('sally/updateSally', {
        updateData: eventContent
      })
      store.commit('inBattle')
      store.commit('sally/updateSally', {
        updateData: content.postData
      })
      store.commit('sally/updateSally', {
        updateData: content
      })
      let party = _.get(store, ['state', 'party', 'parties', content.postData.party_no], {})
      _.each(party.slot, (v, k)=>{
        if(v.serial_id)
        store.commit('swords/updateSword', {
          serialId: v.serial_id, 
          updateData: {inBattle: true}
        })
      })
      let eventId = _.get(store, ['state', 'sally', 'episode_id'])
      let eventType = _.get(TRHMasterData.getMasterData('Event'), [eventId, 'type'], 0)
      let new_square_id = _.get(store, ['state', 'sally', 'square_id']) - 1
      if(eventType == 4){
        store.commit('sally/updateSally', {
          updateData: {square_id: new_square_id}
        })
      }
    }
	
	static ['mission/index'] (content) {
	  /*let missionContent = {
		event: [],
		ignore_mission_ids: []
	  }
	  missionContent.event = content.event
	  missionContent.ignore_mission_ids = content.ignore_mission_ids
	  store.commit('mission/updateMission', {
		updateData: missionContent
	  })
	  console.log(content.event[0]*(-1))
	  if (content.event.length > 0) {
		store.commit('event/updateEventID', {
		  event_id: content.event[0]*(-1)
		})
	  }
	  _.each(content.mission, (v, k) => {
		if (v.mission_id <= 585) {
			store.commit('mission/updateObjective', {
				objId: v.mission_id,
				updateData: v
			})
		}
		else if (v.mission_id >= 695 && v.mission_id <= 714) {
			store.commit('mission/updateMonthly', {
				monthlyId: v.mission_id,
				updateData: v
			})
		}
		else if (v.mission_id >= 673 && v.mission_id <= 694) {
			store.commit('mission/updateDaily', {
				dailyId: v.mission_id,
				updateData: v
			})
		}
		else if (v.mission_id > 0) {
			store.commit('mission/updateEvent', {
				eventId: v.mission_id,
				updateData: v
			})
		}
	  })*/
	}

    static ['mission/reward'] (content) {
      _.each(content.item, v => {
        if(v.item_type == 1){
          let updateItem = {
            consumable_id: null,
            num: null
          }
          updateItem.consumable_id = v.item_id
          updateItem.num = v.item_num
          store.commit('item/addItem', {
            consumableId: updateItem.consumable_id, 
            updateData: updateItem
          })
        }
        if(v.item_type == 4){
          let updateMoney = {
            money: null
          }
          updateMoney.money = v.item_num
          store.commit('resource/addMoney', {
            updateData: updateMoney
          })
        }
      })
    }

    static ['item/use'] (content) {
      let item_num = _.get(store.state, ['item', 'consumable', content.postData.consumable_id, 'num'], 0)
      let item_value = _.get(TRHMasterData.getMasterData('Consumable'), [content.postData.consumable_id, 'value'], 0)
      let updateMoney = {
        money: null
      }
      updateMoney.money = item_num * item_value
      store.commit('resource/addMoney', {
        updateData: updateMoney
      })
    }

    static ['equip/destroy'] (content) {
      let serial_ids = _(content.postData.serial_ids)
        .split('%2C')
        .value()
      _.each(serial_ids, v => {
        store.commit('equip/deleteEquip', {
          serialId: v
        })
      })
    }

    static ['sword/dismantle'] (content) {
      let serial_ids = _(content.postData.serial_id)
        .split('%2C')
        .value()
      _.each(serial_ids, v => {
        store.commit('swords/deleteSword', {
          serialId: v
        })
      })
    }
	
	static ['composition/'] (content) {
	  store.commit('evolution/updateEvolution', {
		updateData: {back: { 0: {serial_id: content.extreme.back[0]}}}
	  })
	}

    static ['composition/compose'] (content) {
      let serial_ids = _(content.postData.material_id)
        .split('%2C')
        .value()
      _.each(serial_ids, v => {
        store.commit('swords/deleteSword', {
          serialId: v
        })
      })
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id, 
        updateData: content.sword
      })
    }
    
    static ['composition/union'] (content) {
      let serial_ids = _(content.postData.material_serial_id)
        .split('%2C')
        .value()
      _.each(serial_ids, v => {
        store.commit('swords/deleteSword', {
          serialId: v
        })
      })
      store.commit('swords/updateSword', {
        serialId: content.sword.serial_id, 
        updateData: content.sword
      })
    }

    static ['duty/complete'] (content) {
      let finished_at = _.get(store.state, ['duty', 'finished_at'], 0)
      store.commit('duty/updateDuty', {
        updateData: _.extend(content, {finished_at: finished_at})
      })
	  
	  let rss = content.reward
	  _.each(_.pick(rss, [1, 2, 3]), (v, k) => {
		if (Object.keys(v).length) {
			_.each(v, (j, i) => {
				store.commit('item/addItem', {
					consumableId: j.item_id, 
					updateData: {
					  consumable_id:  j.item_id,
					  num:  j.item_num
					}
				})
			})
		}
	  })
    }
  }
})