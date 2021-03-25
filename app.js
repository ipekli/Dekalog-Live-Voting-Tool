const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3300;
const WebSocket = require('ws');
const wsevents = require('./wsevents');

/** * The socket connection will be opened in 3300 port. */
const wss = new WebSocket.Server({port: 3300, path: "/wss"});
wsevents.register(wss);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));
app.listen(port,() => console.log("Server started on port"+port));
