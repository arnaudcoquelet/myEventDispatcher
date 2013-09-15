dojo.provide("webapp.myEventDispatcher.controlBase");
dojo.declare("webapp.myEventDispatcher.controlBase",[ICTouchAPI.webApplication],{

	constructor:function(){
	},

  loaded: function(){
    //executed after controler and data constructors, refer to constraints and limitations guide for more information about what can be done in this method
  },

  load: function(){
    ICTouchAPI.eventServices.subscribeToEvent(this, "myMediaViewerPlay", this.myMediaViewerPlayReceived);

    //Load the settings and Medias
    this.refreshMyEvents();
  },

  unload:function(){
    //called when the webapp is unloaded, unsubscrive to events here
  },

  unlock:function(WebappName){
    //executed whenever the webapp is exiting

    //do not remove this line has it could potentially block the phone
    dojo.publish("unlockTransition",[true]);
  },

  myMediaViewerPlayReceived : function(objEvent){
    console.warn("webapp.myEventDispatcher.controlBase - myMediaViewerPlayReceived():" + objEvent);
  },

  getMyEvents : function ()
  {
    if(this.data)
    {
      if(this.data.myEventDispatcherUrl && this.data.myEventDispatcherUrl.length > 0){

        var url = this.data.myEventDispatcherUrl;
        if(! this.endsWith(url, '/') ) {url += '/'; }
        url += "API/events";

        if(this.data.myEventDispatcherUser && this.data.myEventDispatcherUser.length > 0) {
          url += '/to/' + this.data.myEventDispatcherUser;
        }

        this.httpRequest({
          url: url,
          method:"get",
          responseType:"text",
          timeout : 5000,
          callback: this.gotMyEvents,
          callbackError : this.errorOnHttpRequest,
          context:this
        });
      }
      else
      {
        this.updateAllSettings();
      }
    }

    //Plan for Refresh (every 2min by default)
    this.setRefreshMyEvents();
  },


  gotMyEvents : function(xmlStream, callBackParams)
  {
    var events = dojo.fromJson(xmlStream);

    if (events instanceof Array) {
      var eventsCount = events.length;
      if(this.data && eventsCount>0) {

        var t=this;
        setTimeout(function () {
          //Process each event 
          t.submitEvents(events);
          
          //Delete all the events
          t.getDeleteEvents(events);
        } ,  1000);
      }
    } 
  },

  refreshMyEvents : function ()
  {
    //Load the settings
    this.updateAllSettings();

    //Refresh the Medias
    this.getMyEvents();
  },

  setRefreshMyEvents: function()
  {
    //Setup a refresh every 2 minutes by default
    var t=this;

    if(this.data)
    {
      if(this.data._getMyeventsTimeout !== null){
        clearTimeout(this.data._getMyeventsTimeout);
      }
      this.data._getMyeventsTimeout = setTimeout(function () {t.refreshMyEvents();} , (t.data.myEventDispatcherTimer * 1000) || (t.data._defaultRefeshTimer)) ;
    }
    else
    {
      setTimeout(function () {t.refreshMyEvents();} , (t.data.myEventDispatcherTimer * 1000) || (t.data._defaultRefeshTimer));
    }
  },

  submitEvents : function(events){
    console.warn("submitEvents()");

    if (events instanceof Array) {
      var eventsCount = events.length;
      if(eventsCount >0){
        for (var i = 0; i < eventsCount; i++) {
          var element = events[i];

          var eventName = '';
          var eventData = [];

          if(element.hasOwnProperty('type') && element.type.length >0) {
            eventName = element.type;
          }

//          if(element.hasOwnProperty('action') && element.action.length >0 && eventName !== '') { 
//            eventName += "-" + element.action; 
//          }

          if(element.hasOwnProperty('msg') ) {
            eventData.push(element.msg);
          }

          if(eventName !== '') {
            console.warn("publish event: " + eventName + ", "+ eventData);
            dojo.publish("eventServices." + eventName, eventData);
            //ICTouchAPI.eventServices._corePublishEvent(eventName, eventData );
          }
        }
      }     
    }
  },

  getDeleteEvents : function(events){
    console.warn("deleteEvents()");

    if (events instanceof Array) {
      var eventsCount = events.length;
      var eventsIdList = [];

      if(this.data && eventsCount>0) {
        if(this.data.myEventDispatcherUrl && this.data.myEventDispatcherUrl.length > 0){

          if(eventsCount >0){
            for (var i = 0; i < eventsCount; i++) {
              if(events[i].hasOwnProperty('id') && events[i].id !== null && events[i].id !==''){
                eventsIdList.push(events[i].id);
              } 
            }
          }


          var url = this.data.myEventDispatcherUrl;
          if(! this.endsWith(url, '/') ) {url += '/'; }
          url += "API/events/ids/delete";

          this.httpRequest({
            url: url,
            method:"post",
            postData: dojo.toJson({'ids' : eventsIdList }),
            headers: { "Content-Type": "application/json"},
            responseType:"text",
            timeout : 5000,
            callback: this.gotDeleteEvents,
            callbackError : this.errorOnHttpRequest,
            context:this
          });

        }
      }
    }
  },

  gotDeleteEvents : function(xmlStream, callBackParams)
  {
    console.warn("gotDeleteEvents()");
  },


//***************************************************************************************//
//Tools
//***************************************************************************************//
  endsWith : function(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },

//***************************************************************************************//
//HTTPRequest
//***************************************************************************************//
  httpRequest: function(args) {
      //Using the API
      ICTouchAPI.HttpServices.httpRequest(args);
  },
  
  errorOnHttpRequest : function(error){
    ICTouchAPI.debugServices.error("webapp.myEventDispatcher.errorOnHttpRequest():" + _("HTTP Server Unreachable","webapp.myEventDispatcher"));
  },

//***************************************************************************************//
//SETTINGS
//***************************************************************************************//
  updateAllSettings: function ()
  {
    ICTouchAPI.settingServices.getSetting("myEventDispatcherUrl", this,this.getMyEventDispatcherUrl);
    ICTouchAPI.settingServices.getSetting("myEventDispatcherUser", this,this.getMyEventDispatcherUser);
    ICTouchAPI.settingServices.getSetting("myEventDispatcherTimer", this,this.getMyEventDispatcherTimer);

    ICTouchAPI.settingServices.subscribeToSetting(this, "myEventDispatcherUrl", this.onMyEventDispatcherUrlChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "myEventDispatcherUser", this.onMyEventDispatcherUserChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "myEventDispatcherTimer", this.onMyEventDispatcherTimerChanged);
    
    ICTouchAPI.debugServices.error("webapp.myEventDispatcher.settigns - myEventDispatcherUrl:" + this.data.myEventDispatcherUrl);
    ICTouchAPI.debugServices.error("webapp.myEventDispatcher.settigns - myEventDispatcherUser:" + this.data.myEventDispatcherUser);
    ICTouchAPI.debugServices.error("webapp.myEventDispatcher.settigns - myEventDispatcherTimer:" + this.data.myEventDispatcherTimer);

  },
  
  //On Setting changed
  onMyEventDispatcherUrlChanged : function(objUrl){ if (objUrl) { this.data.myEventDispatcherUrl = objUrl.jsValue; this.getMyEvents(); }  },
  onMyEventDispatcherUserChanged: function(objUser){ if(objUser){ this.data.myEventDispatcherUser = objUser.jsValue; this.getMyEvents(); }  },
  onMyEventDispatcherTimerChanged: function(objRefreshTimer){  if(objRefreshTimer) {this.data.myEventDispatcherTimer = objRefreshTimer.jsValue; this.setRefreshMyEvents(); } },
 
  //Get setting
  getMyEventDispatcherUrl: function(objUrl) { if(objUrl){ this.data.myEventDispatcherUrl = objUrl.jsValue; }  },
  getMyEventDispatcherUser: function(objUser) { if(objUser){ this.data.myEventDispatcherUser = objUser.jsValue; } },
  getMyEventDispatcherTimer: function(objRefreshTimer) { if(objRefreshTimer){this.data.myEventDispatcherTimer = objRefreshTimer.jsValue;} },

});
