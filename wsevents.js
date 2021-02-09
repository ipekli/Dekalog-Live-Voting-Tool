const ws = require('ws');
const crypto = require('crypto');
const _ = require('lodash');
const requestIdentity = { "type": "getIdentity", "payload": "" };

let connections = [];
let admin = undefined;

let votes = {
    "buttonFirst": 0,
    "buttonSecond": 0
};

let state = {
    "type": "state",
    "payload": {
        isEnabled: true,
        buttonFirst: {
            text: "Deneme1",
            fontColor: "#FFFFFF",
            backgroundColor: "#000000",
        },
        buttonSecond: {
            text: "Deneme2",
            fontColor: "#FFFFFF",
            backgroundColor: "#000000",
        },
        timeoutEnabled: true,
        timeoutSeconds: 60,
    }
};

async function generateID(){
    const randomBytes = await crypto.randomBytes(12);
    return randomBytes.toString('hex');
}

function findDuplicate(identity) {
    return connections.find(connection => {
        return connection.identity === identity;
    })
}

function updateAdmin(){
    console.log("updateAdmin");
    if(admin && admin.readyState === ws.OPEN) {
        admin.send(JSON.stringify({
            type: "update",
            state: state,
            votes: votes
        }));
    }
}

function getState() {
    return state;
}

function updateClient(client){
    client.send(JSON.stringify(getState()));
}

function updateClients(){
    connections.forEach(connection => {
        updateClient(connection.client)
    })
}

function messageHandler(client) {
    return async (message) => {
        if(!message){
            return;
        }
        const {type, payload} = JSON.parse(message);

        if(!type) return;
        if(type === "identity") {

        }

        if(type === "authenticate") {
            if(payload && payload.pass === "ChoreogrApp") {
                admin = client;
                updateAdmin();
            }
        }

        if(type === "refreshAll") {
            updateAdmin();
        }

        if(type === "vote") {
            if(payload === "buttonFirst" || payload === "buttonSecond") {
                votes[payload]+=1;
                updateAdmin();
            }
        }

        if(type === "admin") {
            if(payload && payload.pass === "ChoreogrApp") {
                if(payload.update){
                    let update = payload.update;
                    state = _.merge(state, update);
                }
                if(payload.votes){
                    votes = payload.votes;
                }
                setTimeout(()=>{updateAdmin()}, 500);
            }
            updateClients();
        }

        if(type === "hardReset") {
            if(payload && payload.pass === "ChoreogrApp") {
                connections = [];
                admin = client;
            }
        }

    }
}

const onconnection = (ws) => {
    ws.on('message', messageHandler(ws));
    connections.push({
        "identity": "",
        "client": ws
    });
    updateClient(ws);
    //ws.send(JSON.stringify(requestIdentity));
};

function register(wss) {
    wss.on('connection', onconnection)
}

module.exports = {
    register
};
