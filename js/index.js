import SceneHandler from "./scene-handler.js";

window.onload = function() {
    navigator.getUserMedia({audio: true}, allowSound, disallowSound);

    function allowSound(stream) {
        const sceneHandler = new SceneHandler(stream);
        sceneHandler.select(SceneHandler.DEFAULT);

        document
            .getElementById ("visualise")
            .addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.MUSIC), false);

        document
            .getElementById ("glow")
            .addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.GLOW), false);

        document
            .getElementById ("style")
            .addEventListener ("click", sceneHandler.incrementStyle.bind(sceneHandler), false);
    }

    function disallowSound(error) {
        console.error(error);
        const sceneHandler = new SceneHandler(null);
        sceneHandler.select(SceneHandler.GLOW);

        document
            .getElementById ("visualise")
            .addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.MUSIC), false);

        document
            .getElementById ("glow")
            .addEventListener ("click", sceneHandler.select.bind(sceneHandler, SceneHandler.GLOW), false);

        document
            .getElementById ("style")
            .addEventListener ("click", sceneHandler.incrementStyle.bind(sceneHandler), false);

    }
};