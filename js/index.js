import Visualiser from "./visualiser.js";

window.onload = function() {
    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const visualiser = new Visualiser(stream);
        document.getElementById ("style").addEventListener ("click", visualiser.changeStyle.bind(visualiser), false);
        visualiser.setMode(Visualiser.DEFAULT_MODE);
    }

    function soundNotAllowed(error) {
        console.log(error);
    }
};