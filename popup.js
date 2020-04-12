let modalBtn = document.getElementById("modal-btn");
let modalBg = document.getElementById("modal-bg"); 

function modal(){
    const textinput = document.getElementById("nameplayer");
    console.log(textinput.value);
    modalBg.style.display = "none";
    subject.next(textinput.value);
};