import MusicScene from "./music-scene.js";
import GlowScene from "./glow-scene.js";
import Tile from "./tile.js";

export default class SceneHandler {
    static MUSIC = 0;
    static GLOW = 1;

    constructor() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then((stream) => this.allowSound(stream))
            .catch((error) => this.disallowSound(error));
    }

    allowSound(stream) {
        this.stream = stream;
        this.select(SceneHandler.MUSIC);
    }

    disallowSound(error) {
        console.error(error);
        this.select(SceneHandler.GLOW);
    }

    select(sceneType) {
        if (this.scene) {
            this.scene.stop = true;
        }

        if (sceneType === SceneHandler.MUSIC) {
            this.scene = new MusicScene(this.stream);
        } else if (sceneType === SceneHandler.GLOW) {
            this.scene = new GlowScene();
        } else {
            console.error("Invalid scene type: " + sceneType);
        }

        this.scene.start();
    }

    incrementStyle() {
        this.scene.tileStyle = (this.scene.tileStyle + 1) % Tile.NUM_STYLES;
    }
}