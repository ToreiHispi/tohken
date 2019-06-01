# Tohken Ranbu Helper
## 介绍
Chrome插件一枚，总而言之多年之后经历了大规模重构

## 功能 (Features)
* 疲劳度查看以及疲劳演算
* Fatigue tracking and fatigue calculation
* 远征，损坏提醒
* Expedition and dammage reminders
* 锻刀和捞刀结果预知
* Armory and swords result prediction

## 运行机理 (Operating mechanism)
利用Chrome Devtools API来监听符合条件的网络通讯并将数据传至路由组件。
Uses the Chrome Devtools API to listen for eligible network traffic and pass data to the routing component.

解析并将处理后的数据传递至view模型中。
Parse and pass the processed data to the view model.

通过Vue.js的数据绑定机制来更新视图
Update the view with the data binding mechanism of Vue.js.

## 参考资料 (Reference Materials)
https://developer.chrome.com/extensions/api_index

https://lodash.com/docs

http://vuejs.org/

https://github.com/eligrey/FileSaver.js

## License
CC0 1.0 Universal