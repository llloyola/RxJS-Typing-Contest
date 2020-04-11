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

/* https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61 */
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
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
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* API Function */
async function randomQuote() {
  const response = await fetch('https://api.quotable.io/random');
  const data = await response.json();
  console.log(`${data.content}`);
}

// Array with some colors
const PLAYER_COUNT = 2;
var playersNumbers = [...Array(PLAYER_COUNT).keys()];
var pointer = 0;

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
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userPlayer = false;

		let sentence = "Apuesto a que nunca has visto a un burro volar";
		// let sentence = await randomQuote();

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get the next player number and send it back to the user
                userPlayer = playersNumbers.shift();
                connection.sendUTF(JSON.stringify({ type:'player', data: userPlayer }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with player number' + userPlayer)


							// If all players are connected send "start game" message
							if (clients.length === PLAYER_COUNT) {
                for (var i=0; i < clients.length; i++) {
                  clients[i].sendUTF(JSON.stringify({ type:'game-beginning', data: sentence }));
                }
                console.log((new Date()) + ' A match is about to start! ' + userName
                            + ' with player number' + userPlayer)
							}

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                

                var playerProgress = parseInt(htmlEntities(message.utf8Data));

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
                if (playerProgress > sentence.length) {
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
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's number to be reused by another user
            playersNumbers.push(userPlayer);
        }
    });

});

