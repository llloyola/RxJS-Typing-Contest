/* API IDEAS */

/* 
  - Conectarse al sistema - Servidor asigna numero de jugador
  - Consultar estado juego - # jugadores conectados [GET] /get-game-status
	- Obtener el estado de "avance" de los jugadores [GET] /get-states
			[{"player": int, "value": int}, ...]
	- Jugador envía su avance cada cierta cantidad de palabras [POST] /set-state
			{"player": int, "value": int}
  - 
*/

/*
	-Usar alguna API gratuita de quotes
*/

"use strict";

const fetch = require("node-fetch");

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'typing-race';

// Websocket server port for development
var webSocketsServerPort = 1338;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */

// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');
}

/* API Function */
function randomQuote() {
  return fetch('https://api.quotable.io/random')
  .then((response) => response.json())
  .then((response) => response.content)
  .then((content) => content.replace(/\n/g, ''));
}

// Array with some colors
const PLAYER_COUNT = 2;
var playersNumbers = [...Array(PLAYER_COUNT).keys()];
var pointer = 0;
var sentence = "";

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    if (clients.length === PLAYER_COUNT) {
        return
    }
    console.log(`${new Date()} Connection from origin ${request.origin}.`);

    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userPlayer = false;

    console.log(`${new Date()} Connection accepted.`);


    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                userName = message.utf8Data;
                userPlayer = playersNumbers.shift();
                connection.sendUTF(JSON.stringify({ type:'player', data: userPlayer }));
                console.log(`${new Date()} User is known as ${userName} with number ${userPlayer}`);


                // If all players are connected send "start game" message
                if (clients.length === PLAYER_COUNT) {
                    const frases = Promise.all([randomQuote(), randomQuote(), randomQuote()])
                    .then(result => {
                        sentence = result.join(' ');
                        for (var i=0; i < clients.length; i++) {
                            clients[i].sendUTF(JSON.stringify({ type:'game-beginning', data: sentence }));
                        }
                        console.log(`${new Date()} A match is about to start!  ${userPlayer} - ${userName}`);
                    });
                    
                }

            } else { // log and broadcast the message
                console.log(`${new Date()} Received message from player ${userPlayer}: ${message.utf8Data}`);
                

                var playerProgress = parseInt(htmlEntities(message.utf8Data)) / sentence.length;

                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    playerProgress: playerProgress,
                    author: userName,
                    player: userPlayer
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }

                // if player progress exceeds sentence length end game
                if (playerProgress === 1) {
                  for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(JSON.stringify({ type:'game-ending', data: {"player": userPlayer} }));
                  }
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userPlayer !== false) {
            console.log(`${new Date()} Peer ${userPlayer} disconnected.`);
            // remove user from the list of connected clients
            clients.splice(index, 1);
            console.log(clients);
            // push back user's number to be reused by another user
            playersNumbers.push(userPlayer);
            playersNumbers = playersNumbers.sort();
        }
    });

});

