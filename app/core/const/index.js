define((require, exports, module) => {
  return {
    SwordStyle: require('./sword/style'),
    SwordType: require('./sword/type'),
	SwordENGType: require('./sword/type_eng'),
    SwordRange: require('./sword/range'),
    SwordInjury: require('./sword/injury'),
	SwordENGName: require('./sword/name'),
	EquipENGName: require('./equip/name'),
	EquipENGType: require('./equip/type'),
	ItemENGName: require('./item/name'),
    FATIGUE: {
      STATUS: {
        NONE: 0,
        TIERD: 1,
        VERY_TIERD: 2
      },
      VALUE: {
        VERY_TIERD: 8, //upper limit (inclusive)
        TIERD: 19,
        NORMAL: 49,
        MAX: 100
      }
    }
  }
})