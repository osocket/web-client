
class OpenSocket {

  constructor(options) {

    options = options || {};

    this.developer_id = options.developer_id || false;
    this.project_id = options.project_id || false;
    this.client_token = options.client_token || false;
    this.server = options.server || 'https://socket.opensocket.ir';
    this.system_id = this.machineId();

    this.onConnect = options.onConnect || (()=>{});
    this.onReceive = options.onReceive || (()=>{});
    this.onDisconnect = options.onDisconnect || (()=>{});
    this.onRegister = options.onRegister || (()=>{});
    this.dependency = false;
  }

  connect(){
    if(this.dependency==false){
      this.loadScript('socket.io.min.js',()=>{
        this._connect()
        this.dependency = true;
      })
    }
    else{
      this._connect()
    }
  }

  _connect()  {

    if (!this.developer_id || !this.project_id || !this.client_token) {
      throw new Error('Config values ​​are not set. Please set developer_id, project_id, client_token');
    }


    this.user_token = this.userToken()

    if(this.user_token && this.user_token.length>5){
      this.register = true;
    }
    else{
      this.register = false;
    }

    var lastTime = this.lastTime();


    var query = {
      register: this.register,
      time: lastTime,
      system_id: this.system_id,
      developer_id: this.developer_id,
      project_id: this.project_id,
      client_token: this.client_token,
      customer:'web-client'
    }

    if (this.user_token) {
      query.token = this.user_token;
    }

    const socket = io(this.server, {
      transports: ["websocket"],
      query: query
    });

    this.socket = socket;

    socket.on("connect", () => {
      console.log('connected to OpenSocket');
      this.onConnect()
    });

    socket.on("disconnect", () => {
      this.onDisconnect();
    });

    socket.on('receive',(message)=>{

      this.onReceive(message);

      try {

        if(message.time){
          this.lastTime(message.time);
        }

        if (message.callback) {
          socket.emit("receive-answer", message.message_id , this.userToken());
        }

      } catch (e) {
        console.error(e);
      }
    })

    socket.on('register',(ob)=>{
      this.setConfig(ob);
      this.onRegister(ob);
      this.reconnect();
    })
  }

  disconnect(){
    this.socket.disconnect();
    this.socket.offAny();
  }

  reconnect(){
    console.log('Register and reconnecting ...');
    this.disconnect();
    setTimeout(()=>{
      this.connect();
    },3000)
  }

  setConfig(json){
    try {
      var config = this.getConfig();
      localStorage.setItem('oconfig',JSON.stringify({
        ...config,
        ...json
      }))
    } catch (e) {
      console.error(e);
    }
  }

  getConfig(){
    try {
      return JSON.parse(localStorage.getItem('oconfig')||'{}');
    } catch (e) {
      return {};
    }
  }

  userToken(){
    try {
      return this.getConfig().token || '';
    } catch (e) {
      return '';
    }
  }

  lastTime(update){
    var config = this.getConfig();

    if(update){
      config.lastTime = update;
      this.setConfig(config);
    }
    else{
      if(config.lastTime){
        return config.lastTime
      }
      else{
        var lastTime = new Date().getTime();
        this.lastTime(lastTime); // update lastTime
      }
    }
  }

  machineId(){
    var uuid = localStorage.getItem('uuid');
    if(!uuid){
      uuid = this.uuidv4();
      localStorage.setItem('uuid',uuid);
    }
    return uuid;
  }

  uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


  loadScript(url, callback)
  {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
  }

}
