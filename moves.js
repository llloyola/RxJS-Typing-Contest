let j1 = document.getElementById("ImgJ1");
let j2 = document.getElementById("ImgJ2");
let winj1 = document.getElementById("winj1");
let winj2 = document.getElementById("winj2");
let losej1 = document.getElementById("losej1");
let losej2 = document.getElementById("losej2");
var Left_j1 = 0;
var Left_j2 = 0;

function RightMove(jugador, mov){
    if (jugador == j1){
        Left_j1 += mov
        j1.style.marginLeft = Left_j1 + "px";
    }
    if (jugador == j2){
        Left_j2 += mov
        j2.style.marginLeft = Left_j2 + "px";
    }
   
}

function ReadMsje (string){
    if (Left_j1 > 1600 || Left_j2 > 1600) {
        if (Left_j1 > Left_j2) {
            ShowText(j1);
            return
        }
        if (Left_j2 > Left_j1) {
            ShowText(j2);
            return
        }
    }
    var msje = string.split(" ");
    if ((msje[0]) === "jugador_1") {
        RightMove(j1, parseInt(msje[1]));
    }
    if ((msje[0]) === "jugador_2"){
        RightMove(j2, parseInt(msje[1]));
    }
}

function moves(){
    let player = Math.floor(Math.random()*(2))+1;
    let mov = Math.floor(Math.random()*(15-10))+10;
    var str = "jugador_";
    str += player;
    str += " ";
    str += mov;
    ReadMsje(str);
}
;

function ShowText(jugador){
    if (jugador == j1) {
        winj1.style.display = "block";
        losej2.style.display = "block";
    }
    if (jugador == j2) {
        winj2.style.display = "block";
        losej1.style.display = "block";
    }
};

setInterval('moves()', 100);