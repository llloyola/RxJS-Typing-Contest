/* wena wena soy el cliente */
const port = 1338;
const subject = rxjs.webSocket.webSocket(`ws://localhost:${port}`);

/* Listening for messages from the server*/

/* https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket */
subject.subscribe(
  msg => {
    if (msg.type === "game-beginning") {
    
    }
    else if (msg.type === "message"){
      let player = msg.data.userPlayer;
      let progress = msg.data.playerProgress;
    }
    else if (msg.type === "game-ending"){
      subject.complete();
    }
    else if (msg.type === "player") {

    }
   }, // Called whenever there is a message from the server.
   err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
   () => console.log('complete') // Called when connection is closed (for whatever reason).
 );


/* Pushing messages to the server */
//subject.subscribe();
// Note that at least one consumer has to subscribe to the created subject - otherwise "nexted" values will be just buffered and not sent,
// since no connection was established!
 
//subject.next({message: 'another message'});
// This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!
 
//subject.complete(); // Closes the connection.
 
//subject.error({code: 4000, reason: 'I think our app just broke!'});
// Also closes the connection, but let's the server know that this closing is caused by some error
