var text = document.getElementById("withjs");
var str = text.innerHTML;

text.innerHTML = "";
var i = 0;

function type_machine(){
    if (i < str.length) {
        text.innerHTML += str.charAt(i);
        i ++;
        setTimeout(type_machine, 100);
    }
}

setTimeout(type_machine, 100);