import MusicScene from "./music-scene.js";
import GlowScene from "./glow-scene.js";
import SceneHandler from "./scene-handler.js";

window.onload = function() {
    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const sceneHandler = new SceneHandler(stream);
        sceneHandler.select(SceneHandler.MUSIC);

        document.getElementById ("visualise").addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.MUSIC), false);
        document.getElementById ("glow").addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.GLOW), false);
    }

    function soundNotAllowed(error) {
        console.log(error);
    }
};