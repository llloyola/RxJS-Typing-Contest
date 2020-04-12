"use strict";

var fetch = require("node-fetch");
var webSocketServer = require('websocket').server;
var http = require('http');


process.title = 'typing-race';



/**********************

  Global variables

**********************/



var clients = [ ];
var players = { };
const PLAYER_COUNT = 3;
var playersNumbers = [...Array(PLAYER_COUNT).keys()];
var playersConnected = 0;
var pointer = 0;
var sentence = "";



/**********************

  Random quote generator

**********************/



function randomQuote() {
  return fetch('https://api.quotable.io/random')
  .then((response) => response.json())
  .then((response) => response.content)
  .then((content) => content.replace(/\n/g, ''));
}



/**********************

  HTTP Server

**********************/



// Server port for development
var PORT = 1338;

var server = http.createServer(function(request, response) { });
server.listen(PORT, function() {
    console.log((new Date()) + " Server is listening on port " + PORT);
});



/**********************

  Websocket definition

**********************/



var wsServer = new webSocketServer({ httpServer: server });


wsServer.on('request', function(request) {
    if (playersConnected === PLAYER_COUNT) { return }

    console.log(`${new Date()} Connection from origin ${request.origin}.`);

    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userPlayer = false;

    console.log(`${new Date()} Connection accepted.`);

    // Send players list to player
    connection.sendUTF(JSON.stringify({ type:'players', data: Object.keys(players).map((k) => [k, players[k].name]) }));

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                userName = message.utf8Data;
                userName = userName.replace(/['"]+/g, '');
                userPlayer = playersNumbers.shift();
                connection.sendUTF(JSON.stringify({ type:'player', data: userPlayer, username: userName }));

                console.log(`${new Date()} User is known as ${userName} with number ${userPlayer}`);

                // Add player to currently connected players list
                players[userPlayer] = { name: userName };

                // Send players list to all players
                for (var i=0; i < clients.length; i++) {
                  clients[i].sendUTF(JSON.stringify({ type:'players', data: Object.keys(players).map((k) => [k, players[k].name]) }));
                }

                // If all players are connected send "start game" message
                if (Object.keys(players).length === PLAYER_COUNT) {
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


                var playerProgress = parseInt(message.utf8Data) / sentence.length;

                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    playerProgress: playerProgress,
                    author: userName,
                    player: userPlayer
                };

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
                  players = {};
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(message) {
        if (userName !== false && userPlayer !== false) {
            console.log(`${new Date()} Peer ${userPlayer} disconnected.`);
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's number to be reused by another user
            playersNumbers.push(userPlayer);
            playersNumbers = playersNumbers.sort();
            // delete player from players dictionary
            delete players[userPlayer];

            // Send players list to player
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(JSON.stringify({ type:'players', data: Object.keys(players).map((k) => [k, players[k].name]) }));
            }
        }
    });

});
