let chart;

let ws;
function connectws(){
    ws = new WebSocket("wss://domain.com/wss");
    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: "authenticate",
            "payload": {"pass": "SecretPass!"}
        }));
        ws.onmessage = m => {
            let _state, _votes;
            if(m && m.data){
                const {type, state, votes} = JSON.parse(m.data);
                if(type !== "update") return;
                _state = state;
                _votes = votes;
            }
            if(_votes){
                const serverVotes = _votes;
                if(serverVotes.buttonFirst || serverVotes.buttonFirst === 0){
                    chart.options.data[0].dataPoints[0].y = serverVotes.buttonFirst;
                }
                if(serverVotes.buttonSecond || serverVotes.buttonSecond === 0){
                    chart.options.data[0].dataPoints[1].y = serverVotes.buttonSecond
                }
                chart.render()
            }
            if(_state){
                const serverState = _state.payload;
                $("#isEnabled")[0].checked = serverState.isEnabled;
                $("#timeoutEnabled")[0].checked = serverState.timeoutEnabled;
                $("#timeoutSeconds")[0].value = serverState.timeoutSeconds;

                $("#voteA")[0].value = serverState.buttonFirst.text;
                $("#colorA")[0].value = serverState.buttonFirst.fontColor;
                $("#backgroundA")[0].value = serverState.buttonFirst.backgroundColor;

                $("#voteB")[0].value = serverState.buttonSecond.text;
                $("#colorB")[0].value = serverState.buttonSecond.fontColor;
                $("#backgroundB")[0].value = serverState.buttonSecond.backgroundColor;
            }
        };
    };
    return ws;
}
ws = connectws();





window.onload = function () {
    chart = new CanvasJS.Chart("chart", {
        theme: "light2",
        animationEnabled: false, // change to true
        title:{
            text: "Vote Chart"
        },
        data: [
            {
                type: "column",
                dataPoints: [
                    { label:'Vote A', y: 0 },
                    { label:'Vote B', y: 0 },
                ],
            }
        ]
    });
    chart.render();
};



function send(update){
    console.log("send");
    if(!ws || ws.readyState !== ws.OPEN) {
        ws = connectws();
        return
    }
    ws.send(JSON.stringify({
        type: "admin",
        "payload": {
            "pass":"SecretPass!",
            "update": {
                "payload": update
            }
        }
    }))
}
function isEnabled(){
    const update = {
        "isEnabled": $("#isEnabled")[0].checked
    };
    send(update);
}

function timeoutEnabled(){
    const update = {
        "timeoutEnabled": $("#timeoutEnabled")[0].checked
    };
    send(update);
}
function timeoutSeconds(){
    const update = {
        "timeoutSeconds": $("#timeoutSeconds")[0].value
    };
    send(update);
}
function voteA(){
    chart.options.data[0].dataPoints[0].label = $("#voteA")[0].value;
    const update = {
        "buttonFirst": {
            "text": $("#voteA")[0].value,
            "fontColor": $("#colorA")[0].value,
            "backgroundColor": $("#backgroundA")[0].value
        }
    };
    send(update)
}
function voteB(){
    chart.options.data[0].dataPoints[1].label = $("#voteB")[0].value;
    const update = {
        "buttonSecond": {
            "text": $("#voteB")[0].value,
            "fontColor": $("#colorB")[0].value,
            "backgroundColor": $("#backgroundB")[0].value
        }
    };
    send(update)
}

function updateAll(){
    chart.options.data[0].dataPoints[0].label = $("#voteA")[0].value;
    chart.options.data[0].dataPoints[1].label = $("#voteB")[0].value;
    const update = {
        "isEnabled": $("#isEnabled")[0].checked,
        "timeoutEnabled": $("#timeoutEnabled")[0].checked,
        "timeoutSeconds": $("#timeoutSeconds")[0].value,
        "buttonFirst": {
            "text": $("#voteA")[0].value,
            "fontColor": $("#colorA")[0].value,
            "backgroundColor": $("#backgroundA")[0].value
        },
        "buttonSecond": {
            "text": $("#voteB")[0].value,
            "fontColor": $("#colorB")[0].value,
            "backgroundColor": $("#backgroundB")[0].value
        }
    };
    send(update)
}

function refreshAll(){
    if(!ws || ws.readyState !== ws.OPEN){
        ws = connectws();
        return;
    }
    ws.send(JSON.stringify({
        type: "refreshAll",
        payload: ""
    }))
}

function resetVotes(){
    if(!ws || ws.readyState !== ws.OPEN){
        ws = connectws();
        return;
    }
    ws.send(JSON.stringify({
        type: "admin",
        "payload": {
            "pass": "SecretPass!",
            "votes": {
                "buttonFirst": 0,
                "buttonSecond": 0
            }
        }
    }))
}

function hardReset(){
    if(!ws || ws.readyState !== ws.OPEN){
        ws = connectws();
        return;
    }
    ws.send(JSON.stringify({
        type: "hardReset",
        "payload": {
            "pass": "SecretPass!",
        }
    }))
}