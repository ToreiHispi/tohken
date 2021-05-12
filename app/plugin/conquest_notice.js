define((require, exports, module) => {
  return (store) => {
    store.subscribe((mutation, state) => {
      if (state.config.conquest_notice == true) {
        if (mutation.type === 'party/updateParty') {
          let party_nameJPN = mutation.payload.updateData.party_name
		  let party_name = party_nameJPN.replace('第','Team ').replace('部隊','')
          let status = mutation.payload.updateData.status
          let finished_at = mutation.payload.updateData.finished_at
          let party = _.get(state, ['party', 'parties', mutation.payload.updateData.party_no])
          if (!party) return
          if(party.isIntervalSet == false || party.isIntervalSet == null) {
            let check = setInterval(function isConquestFinished(){
              party.isIntervalSet = true
              if(status == 2 && moment(parseValues(finished_at)).isBefore(Date.now())) {
                if(party.isNoticed == false || party.isNoticed == null){
                store.dispatch('notice/addNotice', {
                  title: `${party_name} has return from expedition!`,
                  message: `End time： ${moment(parseValues(finished_at)).format('HH:mm:ss')}`,
                  context: 'Please recieve them as soon as possible!',
                  renotify: true,
                  disableAutoClose: false,
                  swordBaseId: state.config.secretary,
                  icon: `static/sword/${state.config.secretary}.png`
                })
                party.isNoticed = true
                }
                party.isIntervalSet = false
                clearInterval(check)
              } else if (status == 2) {
                party.isNoticed = false
              }
              if(status != 2){
                party.isNoticed = false
                party.isIntervalSet = false
                clearInterval(check)
              }
            }, 3000)
          }
        }
      }
    })
  }
})