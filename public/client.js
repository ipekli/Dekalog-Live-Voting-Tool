/** * Here the client side is regulated. The work flow from the client side is as follows
    * Set up the WebSocket connection, if it brokes, try it again.
    * When a new state comes from admin side, make the required changes
    * Send the information what client clicks as answer to the admin panel */

let types = {
  getIdentity: 'getIdentity',
  setIdentity: 'setIdentity',
  information: 'information',
  state: 'state',
};


function WebSocketClient(url){
  this.number = 0;	// Message number
  this.url = url;
  this.autoReconnectInterval = 1200;	// ms
  this.instance = new WebSocket(url)
}
WebSocketClient.prototype.open = function(){
  if(this.instance.readyState !== WebSocket.OPEN || this.instance.readyState !== WebSocket.CONNECTING){
    this.instance = new WebSocket(this.url);
  }
  this.instance.onopen = () =>{
    this.onopen();
  };
  this.instance.onmessage = (data,flags)=>{
    this.number ++;
    this.onmessage(data,flags,this.number);
  };
  this.instance.onclose = (e) =>{
    if (e.code === 1000) {
      console.log("WebSocket: closed");
    } else {
      this.reconnect(e);
    }
    this.onclose(e);
  };
  this.instance.onerror = (e)=>{
    if (e.code === 'ECONNREFUSED') {
      this.reconnect(e);
    } else {
      this.onerror(e);
    }
  }
};

WebSocketClient.prototype.send = function(data){
  try{
    this.instance.send(data);
  }catch (e){
    this.instance.emit('error',e);
  }
};

WebSocketClient.prototype.reconnect = function(e){
  console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,e);
  //this.instance.removeAllListeners();
  let that = this;
  setTimeout(function(){
    console.log("WebSocketClient: reconnecting...");
    that.open();
  },this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function(e){	console.log("WebSocketClient: open",arguments);	};
WebSocketClient.prototype.onmessage = function(data,flags,number){	console.log("WebSocketClient: message",arguments);	};
WebSocketClient.prototype.onerror = function(e){	console.log("WebSocketClient: error",arguments);	};
WebSocketClient.prototype.onclose = function(e){	console.log("WebSocketClient: closed",arguments);	};

/** * This function defines the URL of the server. Change it with yours.
    * ws://url.com/wss */

let ws = new WebSocketClient("ws://ipek.li/wss");


ws.onmessage = event => {
  const { type, payload } = JSON.parse(event.data);
  if(!type) return;
  switch (type) {
    case types.getIdentity:
      ws.send(JSON.stringify({type: 'identity', payload: getIdentity()}));
      break;
    case types.setIdentity:
      setIdentity(payload);
      break;
    case types.state:
      setButtonProperties(payload);
      break;
  }
};

ws.open();

function getIdentity() {
  return localStorage.getItem('identity')
}

function setIdentity(value) {
  return localStorage.setItem('identity', value)
}

/** * buttonFirst and buttonSecond are the butons which will shown
 * in index.html */

const buttonFirst = document.getElementById('buttonFirst');
const buttonSecond = document.getElementById('buttonSecond');

/** * buttonApprove is used for a feedback after the vote input.
 * After the client has voted, it will appear "Stimme gezählt - Your vote is counted".
 * It can be enabled/disabled in the admin. */

const buttonApprove = document.getElementById('buttonApprove');

let overAllButtonProperties = {
  clickInterval: null,
  disabled: true,
  clickIntervalIsActive: false,
};

/** * Vote for buttonFirst when clicked */

buttonFirst.addEventListener('click', function() {
  if(!ws || ws.readyState !== ws.OPEN) return;
  setButtonTimeoutSettings('buttonFirst'); /** * This function is not allowing the client to vote - when TimeOut is enabled. */
  ws.send(JSON.stringify({
    type: 'vote',
    payload: 'buttonFirst'
  }));
});

/** * Vote for buttonSecond when clicked */

buttonSecond.addEventListener('click', function() {
  if(!ws || ws.readyState !== ws.OPEN) return;
  setButtonTimeoutSettings('buttonSecond'); /** * This function is not allowing the client to vote - when TimeOut is enabled. */
  ws.send(JSON.stringify({
    type: 'vote',
    payload: 'buttonSecond'
  }));
});

function setButtonTimeoutSettings(event) {
  /** * If admin disabled the voting function, the buttons will not be shown. */

  buttonFirst.hidden = overAllButtonProperties.disabled;
  buttonSecond.hidden = overAllButtonProperties.disabled;

  /** * If admin enabled the voting function, the buttons will be shown. */
  if(overAllButtonProperties.clickInterval && event && overAllButtonProperties.clickIntervalIsActive) {
    buttonFirst.hidden = true;
    buttonSecond.hidden = true;
    buttonApprove.style.backgroundColor = document.getElementById(event).style.backgroundColor;
    buttonApprove.style.color = document.getElementById(event).style.color;
    buttonApprove.hidden = false;
    setTimeout(() => {
      buttonApprove.hidden = true;
      buttonFirst.hidden = false;
      buttonSecond.hidden = false;
    }, overAllButtonProperties.clickInterval)
  }
}

function setButtonProperties(payload) {
  if(payload.buttonFirst) {
    let button = payload.buttonFirst;
    if(button.text && button.text.length > 0){
      buttonFirst.value = button.text;
    }
    if(button.fontColor) {
      buttonFirst.style.color = button.fontColor
    }
    if(button.backgroundColor && button.backgroundColor.length > 0) {
      buttonFirst.style.backgroundColor = button.backgroundColor
    }
  }
  if(payload.buttonSecond) {
    let button = payload.buttonSecond;
    if(button.text && button.text.length > 0){
      buttonSecond.value = button.text
    }
    if(button.fontColor && button.fontColor.length) {
      buttonSecond.style.color = button.fontColor
    }
    if(button.backgroundColor && button.backgroundColor.length > 0) {
      buttonSecond.style.backgroundColor = button.backgroundColor
    }
  }
  if(typeof payload.isEnabled !== "undefined"){
    overAllButtonProperties.disabled = !payload.isEnabled; /** * When this part is true, the buttons will be hidden. */
    if(typeof payload.timeoutEnabled !== "undefined" && payload.timeoutSeconds) { /** * When the TimeOut is enabled (clickIntervalIsActive) take the
     * given time and duplicate with *1000 (because millisecond)
     */
      overAllButtonProperties.clickIntervalIsActive = payload.timeoutEnabled;
      overAllButtonProperties.clickInterval = parseInt(payload.timeoutSeconds, 10) * 1000
    } 
    setButtonTimeoutSettings()
  }
}

