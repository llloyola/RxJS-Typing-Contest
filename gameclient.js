
CHECK_INTERVAL = 10;
const game_sentence = "I checked to make sure that he was still alive.";
let pointer = 0;


document.addEventListener("DOMContentLoaded", function(event) {

const text_input = document.getElementById("textinput");
const sentence_placeholder = document.getElementById("sentenceplaceholder");

// Erase input
text_input.value = "";

// Add game sentence
sentenceplaceholder.innerHTML = game_sentence;

// Observer for whats being typed on textarea
const typing_observer = {
 next: function(value) {
   let prev_text = game_sentence.substring(0, pointer);
   let actual_text = game_sentence.substring(pointer, pointer + text_input.value.length);
   let next_text = game_sentence.substring(pointer + text_input.value.length);

   if (text_input.value.localeCompare(actual_text)) {
     sentenceplaceholder.innerHTML = `<span class="correcttext" >${prev_text}</span><span class="wrongtext" >${actual_text}</span>${next_text}`;
   } else {
     sentenceplaceholder.innerHTML = `<span class="correcttext" >${prev_text}</span><span class="correcttext" >${actual_text}</span>${next_text}`;
     if (text_input.value.length === CHECK_INTERVAL){
       pointer += CHECK_INTERVAL;
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
