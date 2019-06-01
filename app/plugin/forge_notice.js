define((require, exports, module) => {
  let TRHMasterData = require('app/core/master')
  let TRH = require('app/core/const/index')
  return (store) => {
    store.subscribe((mutation, state) => {
      
        if (mutation.type === 'forge/updateForge') {
          let { updateData } = mutation.payload
          let getSwordId = updateData.sword_id
          let time = moment(parseValues(mutation.payload.updateData.finished_at))
          //let swordNameJPN = _.get(TRHMasterData.getMasterData('Sword'), [getSwordId, 'name'], 'None')
		  let swordName = _.get(TRHMasterData.getMasterData('Sword'), [getSwordId, 'name'], 'None') == 'None' ? 'None' : TRH.SwordENGName[String(getSwordId)]['full']
		  let timeout = _.get(state, ['config', 'timeout'], 3)*1000
          if (timeout<3000){
            timeout = 3000
          }
          let logId = `${updateData.slot_no}#${time.unix()}`
          store.commit('log/addForgeLog', {
            logId,
            ...mutation.payload.updateData
          })
          if (state.config.forge_notice == true) {
          if (getSwordId) {
            store.dispatch('notice/addNotice', {
              title: `Smithing Result: ${swordName}`,
              message: `End Time: ${time.format('HH:mm:ss')}`,
              context: time.isBefore() ? "It's done!" : 'Please wait patiently or use a Help Token.',
			  timeout: timeout,
              tag: getSwordId,
              renotify: true,
			  disableAutoClose: false,
              swordBaseId: getSwordId,
              icon: `static/sword/${getSwordId}.png`
            })
          } else {
            store.dispatch('notice/addNotice', {
              title: `Forging New Sword`,
              message: `End Time： ${time.format('HH:mm:ss')}`,
              context: 'You need to re-enter the Smithing tab to see the sword prediction.',
              tag: getSwordId,
              renotify: true,
			  disableAutoClose: false,
              swordBaseId: getSwordId,
              icon: `static/sword/${getSwordId}.png`
            })
          }
        }
      }
    })
  }
})