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

export const updatePlayerPosition = (player, percentage) => {
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


/*
let g = 0;

function moves(){
    let player = 1;
    let mov = g + 0.05;
    g = mov;
    updatePlayerPosition(player, mov);
};

setInterval('moves()', 1000);
*/

