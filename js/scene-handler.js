import MusicScene from "./music-scene.js";
import GlowScene from "./glow-scene.js";

export default class SceneHandler {
    static MUSIC = 0;
    static GLOW = 1;
    static DEFAULT = SceneHandler.MUSIC;

    constructor(stream) {
        this.stream = stream;
    }

    select(sceneType) {
        if (this.scene) {
            this.scene.stop = true;
        }

        if (sceneType === SceneHandler.MUSIC) {
            this.scene = new MusicScene(this.stream);
        } else if (sceneType === SceneHandler.GLOW) {
            this.scene = new GlowScene();
        }

        this.scene.start();
    }
}