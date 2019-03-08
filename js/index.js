import SceneHandler from "./scene-handler.js";

window.onload = function() {
    const sceneHandler = new SceneHandler();
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
};