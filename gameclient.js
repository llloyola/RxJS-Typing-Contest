/**********************

  Graphic Interface

**********************/


let game_box = document.getElementById("box");
const maxRaceLength = game_box.clientWidth - document.getElementById("ImgPlayer0").getElementsByTagName("img")[0].clientWidth;


const movePlayerToTheRight = (player, mov) => {
    let playerImg = document.getElementById(`ImgPlayer${player}`);
    playerImg.style.marginLeft = mov*maxRaceLength + "px";
};

const updatePlayerPosition = (player, percentage) => {
    if (percentage >= 1) percentage = 1;
    movePlayerToTheRight(player, percentage);
    if (percentage >= 1){
        showWinText(player);
    }
};

const showWinText = player => {
    let playerNumbers = [0, 1, 2]
    let playerImg = document.getElementById(`ImgPlayer${player}`);
    playerImg.getElementsByClassName("winner-message")[0].style.display = "block";

    [0, 1, 2].forEach((e) => {
      if (e !== player){
        document.getElementById(`ImgPlayer${e}`).getElementsByClassName("loser-message")[0].style.display = "block";
      }
    });
};

function makeUsersList(array) {
    // Create containment div
    let containment = $('<div/>');
    // Create title:
    let title = $('<p/>');
    title.append("Usuarios conectados:");
    // Create the list element:
    let list = $('<ul/>');

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        let item = $('<li/>');
        // Set its contents:
        item.append(`${array[i][0]} - ${array[i][1]}`);
        // Add it to the list:
        list.append(item);
    }

    // Finally, return the constructed list:
    if (array.length === 0){
      list = "No hay jugadores conectados aún."
    };

    containment.append(title);
    containment.append(list);
    
    return containment[0];
};

function hideModalLogin() {

}

function hideModal() {
  const modal = document.getElementById("modal-bg");
  modal.style.display = "none";
}

function showModal() {
  document.getElementById("modal-insert-name").style.display = "block";
  const modal = document.getElementById("modal-bg");
  modal.style.display = "block";
}



/**********************

  Websocket definition

**********************/



// Production websocket
//const subject = rxjs.webSocket.webSocket(`ws://typing-contest-game.herokuapp.com`);

// Development websocket
const subject = rxjs.webSocket.webSocket(`ws://localhost:1338`);



/**********************

  Variables

**********************/



const CHECK_INTERVAL = 10;
let pointer = 0;



/**********************

  Main Code

**********************/



document.addEventListener("DOMContentLoaded", function(event) {

const text_input = document.getElementById("textinput");
const sentence_placeholder = document.getElementById("sentenceplaceholder");
let game_sentence = '';
sentenceplaceholder.innerHTML = game_sentence;

// Erase input
text_input.value = "";

subject.subscribe(
  // Called whenever there is a message from the server.
  msg => {
    console.log(msg);
    if (msg.type === "game-beginning") {
      // Add game sentence
      game_sentence = msg.data;
      sentenceplaceholder.innerHTML = msg.data;
      hideModal();
    }
    else if (msg.type === "message"){
      let player = msg.data.player;
      let progress = msg.data.playerProgress;
      updatePlayerPosition(player, progress);
    }
    else if (msg.type === "game-ending"){
      subject.complete();
      subject.subscribe();
    }
    else if (msg.type === "player") {
      console.log("You are player number  " + msg.data);
    }
    else if (msg.type === "players") {
      let playersList = msg.data;

      // Change character names
      playersList.forEach((e) => {
        let playerNameDiv = document.getElementById(`playername${e[0]}`);
        playerNameDiv.innerHTML = e[1];
      });

      // Add elements to connected players list
      let playersListDiv = $("#modal-bg").find(".players-list")[0];
      playersListDiv.innerHTML = "";
      let divList = makeUsersList(playersList);
      console.log(divList);
      playersListDiv.append(divList);
    }
  },
  // Called if at any point WebSocket API signals some kind of error.
  err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
  // Called when connection is closed (for whatever reason).
  () => console.log('complete')
);

subject.subscribe();

// Game Lobby modal
//$("#modal-btn").click(() => {
//  console.log("-------");
//  let text_input = document.getElementById("nameplayer");
//  subject.next(text_input.value);
//  text_input.value = "";
//  document.getElementById("modal-insert-name").style.display = "none";
//});
//
const modalBtn = document.getElementById('modal-btn');
const clickSubject = rxjs.fromEvent(modalBtn, 'click');
clickSubject.subscribe(() => {
  console.log("-------");
  let text_input = document.getElementById("nameplayer");
  subject.next(text_input.value);
  text_input.value = "";
  document.getElementById("modal-insert-name").style.display = "none";
});

// In-game typing textarea observer
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
