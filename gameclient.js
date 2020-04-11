

/* Listening for messages from the server*/

/* https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket */

let j1 = document.getElementById("ImgJ1");
let j2 = document.getElementById("ImgJ2");
let game_box = document.getElementById("box");

const maxRaceLength = game_box.clientWidth - j1.getElementsByTagName("img")[0].clientWidth;

function movePlayerToTheRight(player, mov){
    if (player === 0){
        j1.style.marginLeft = mov*maxRaceLength + "px";
    }
    if (player === 1){
        j2.style.marginLeft = mov*maxRaceLength + "px";
    }

};
const updatePlayerPosition = (player, percentage) => {
    if (percentage >= 1) percentage = 1;

    movePlayerToTheRight(player, percentage);

    if (percentage >= 1){
        showWinText(player);
    }
};

function showWinText(player){
    if (player === 0) {
        j1.getElementsByClassName("winner-message")[0].style.display = "block";
        j2.getElementsByClassName("loser-message")[0].style.display = "block";
    }
    if (player === 1) {
        j2.getElementsByClassName("winner-message")[0].style.display = "block";
        j1.getElementsByClassName("loser-message")[0].style.display = "block";
    }
};

const CHECK_INTERVAL = 10;

let pointer = 0;

// Production websocket
const subject = rxjs.webSocket.webSocket(`ws://typing-contest-game.herokuapp.com`);

// Development websocket
//const subject = rxjs.webSocket.webSocket(`ws://localhost:1338`);


document.addEventListener("DOMContentLoaded", function(event) {

const text_input = document.getElementById("textinput");
const sentence_placeholder = document.getElementById("sentenceplaceholder");
let game_sentence = '';
sentenceplaceholder.innerHTML = game_sentence;

// Erase input
text_input.value = "";

subject.subscribe(
  msg => {
    console.log(msg);
    if (msg.type === "game-beginning") {
      // Add game sentence
      game_sentence = msg.data;
      sentenceplaceholder.innerHTML = msg.data;
    }
    else if (msg.type === "message"){
      let player = msg.data.player;
      let progress = msg.data.playerProgress;
      updatePlayerPosition(player, progress);
    }
    else if (msg.type === "game-ending"){
      subject.complete();
    }
    else if (msg.type === "player") {
      console.log("You are player number  " + msg.data);
    }
  }, // Called whenever there is a message from the server.
  err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
  () => console.log('complete') // Called when connection is closed (for whatever reason).
);

subject.subscribe();
subject.next('Yo');

// Observer for whats being typed on textarea
const typing_observer = {
 next: function(value) {
   let text = text_input.value;
   let prev_text = game_sentence.substring(0, pointer);
   let actual_text = game_sentence.substring(pointer, pointer + text.length);
   let next_text = game_sentence.substring(pointer + text.length);

   if (text.localeCompare(actual_text)) {
     sentenceplaceholder.innerHTML = `<span class="correcttext" >${prev_text}</span><span class="wrongtext" >${actual_text}</span>${next_text}`;
   } else {
     sentenceplaceholder.innerHTML = `<span class="correcttext" >${prev_text}</span><span class="correcttext" >${actual_text}</span>${next_text}`;
     if (text.length >= CHECK_INTERVAL || next_text === ""){
       pointer += text.length;
       subject.next(pointer);
       text_input.value = "";      
     }
   }
 },
 error: function(err) {
   console.error(err);
 },
 complete: function() {
   console.log("Completed");
 }
};

// Observable from KeyUp event
const observable = rxjs.fromEvent(text_input, "keyup");

// Subscribe to begin listening
observable.subscribe(typing_observer);

});
