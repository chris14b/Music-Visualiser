import AudioInterpreter from "./audio-interpreter.js";

window.onload = function() {
    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const audioInterpreter = new AudioInterpreter(stream);
    }

    function soundNotAllowed(error) {
        console.log(error);
    }
};