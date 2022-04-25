# web-client

### Load library
```html
<script src="OpenSocket.js" charset="utf-8"></script>
```

### Usage
```JS

const config = {

    developer_id : '...',
    project_id:'...',
    client_token:'.....',


    onConnect:onConnect,
    onReceive:onReceive,
    onRegister:onRegister,
    onDisconnect:onDisconnect,
}

var osocket = new OpenSocket(config);


/*
 * Connect to server
*/
osocket.connect();


function onConnect(){
  console.log('onConnect');
}

function onReceive(msg){
    console.log('onReceive',msg);
}

function onRegister(result){
    console.log('onRegister',result);
}

function onDisconnect(){
    console.log('onDisconnect');
}

```
