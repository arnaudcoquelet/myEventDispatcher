dojo.provide("webapp.myEventDispatcher.dataBase");
dojo.declare("webapp.myEventDispatcher.dataBase",null,{

  myEventDispatcherUrl    : '',
  myEventDispatcherUser   : '',
  myEventDispatcherTimer  : 5 * 1000,
  myEventDispatcherList   : [],

  _defaultRefeshTimer     : 2 * 1000,
  _getMyeventsTimeout     : null,

 

	constructor:function(){
	},


});
