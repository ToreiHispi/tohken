define((require, exports, module) => {
    let TRH = require('app/core/const/index')
	return (store) => {
    store.subscribe((mutation, state) => {
      if (state.config.repair_notice == true) {
        if (mutation.type === 'repair/updateRepair') {
          let swordSerialId = mutation.payload.updateData.sword_serial_id
          let sword = _.get(state, ['swords', 'serial', swordSerialId])
		  let swordName = TRH.SwordENGName[sword.sword_id][sword.sword_id]
		  let timeout = (_.get(state, ['config', 'timeout'], 3)/2)*1000
		  if (timeout<3000){
            timeout = 3000
          }
          store.dispatch('notice/addNotice', {
            //title: `Ongoing Repair：${sword.name} `,
			title: `Ongoing Repair：${swordName} `,
            message: `End Time: ${moment(parseValues(mutation.payload.updateData.finished_at)).format('MM/DD HH:mm:ss')}`,
            context: moment(parseValues(mutation.payload.updateData.finished_at)).isBefore() ? 'Finished！' : 'Please wait patiently or use a Help Token.',
            tag: sword.sword_id,
            renotify: true,
			timeout: timeout,
            swordBaseId: sword.sword_id,
            icon: `static/sword/${sword.sword_id}.png`
          })
        }
      }
    })
  }
})