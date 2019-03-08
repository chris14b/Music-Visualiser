import Visualiser from "./visualiser.js";

window.onload = function() {
    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const visualiser = new Visualiser(stream);
        document.getElementById ("visualise").addEventListener ("click", visualiser.initialiseVisualisation.bind(visualiser), false);
        document.getElementById ("glow").addEventListener ("click", visualiser.glow.bind(visualiser), false);
        document.getElementById ("style").addEventListener ("click", visualiser.changeStyle.bind(visualiser), false);
        visualiser.mode = Visualiser.DEFAULT_MODE;
        visualiser.changeMode();
    }

    function soundNotAllowed(error) {
        console.log(error);
    }
};