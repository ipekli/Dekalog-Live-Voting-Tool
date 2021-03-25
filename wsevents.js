/** * This is a WebSocket Library */
const ws = require('ws');

/** * This is a library for creating random IDs. */

const crypto = require('crypto');

/** * This is an utility library. It helps for the transforming
 * basic data transformations. */

const _ = require('lodash');


/** *This asks the identity of the user */
const requestIdentity = { "type": "getIdentity", "payload": "" };
const constants = require('./constants');

/** * Every WebSocket connection is kept in this
 * NodeJs Array
 * When we send a message, the message will be sent
 * to the WebSocket connections in this array. */

let connections = [];

/** * Here is the admin defined. Admin is the person
 * who can access to the admin panel in front-end */

let admin = undefined;

/** * In this function, the numbers of the votes will be kept.
 * How many people clicked on first button and second button.
 * It starts with zero. */

let votes = {
    "buttonFirst": 0,
    "buttonSecond": 0
};


/** * The design of the voting tool. Here is defined,
 * what the end-user will see. You can define the font color, background color,
 * text and Timeout Function. */
let state = {
    "type": "state",
    "payload": {
        /** * when the "isEnabled" false, the tool will not
         * anymore visible */
        isEnabled: true,
        buttonFirst: {
            text: "Field 1",
            fontColor: "#FFFFFF",
            backgroundColor: "#000000",
        },
        buttonSecond: {
            text: "Field 2",
            fontColor: "#FFFFFF",
            backgroundColor: "#000000",
        },
        /** * Timeout function is allowing the users
         * just voting one time in given second.
         * In this example, the user can vote just 1 time
         * every 60 second. */
        timeoutEnabled: true,
        timeoutSeconds: 60,
    }
};

/** * This function creates ID */

async function generateID(){
    const randomBytes = await crypto.randomBytes(12);
    return randomBytes.toString('hex');
}

/** * This function controls if a connection
 * is connected multiple times. It looks in the connections array above
 * to check, if there is same ID duplicated or multiple times. */


function findDuplicate(identity) {
    return connections.find(connection => {
        return connection.identity === identity;
    })
}

/** * Admin can be just one person. When multiple devices connecting
 * with the admin panel, this function identify new admin. The last
 * person is always new admin. */

function updateAdmin(){
    if(admin && admin.readyState === ws.OPEN) {
        /** *The last connected admin gets the last settings and voting numbers with this function. */
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

/** * This function sends the last state to the connected users */

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
            if(payload && payload.pass === constants.ADMIN_PASSWORD) {
                admin = client;
                updateAdmin();
            }
        }

        /** * This function refresh the admin panel with the last states
         * It's thought for the case of connection failures. */

        if(type === "refreshAll") {
            updateAdmin();
        }

        /** * When the person gives a vote, this function sents the vote to the admin panel.
         * In this case, there are just two options (buttonFirst and buttonSecond) available. */

        if(type === "vote") {
            if(payload === "buttonFirst" || payload === "buttonSecond") {
                votes[payload]+=1;
                updateAdmin();
            }
        }

        /** * This function enables the changes in the admin panel for the voting tool.
         * F.e the colors of the buttons, texts, timeouts, etc. */

        if(type === "admin") {
            if(payload && payload.pass === constants.ADMIN_PASSWORD) {
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

        /** * This function firstly ignores all the socket connections, identifying admin again.
         * Hard reset is needed when the tool doesn't work correctly anymore.
         * When a session is finished, hard reset should be used. Otherwise, the connection array
         * will have too many entries and system will work laggy. */

        if(type === "hardReset") {
            if(payload && payload.pass === constants.ADMIN_PASSWORD) {
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
