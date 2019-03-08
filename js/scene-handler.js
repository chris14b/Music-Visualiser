import MusicScene from "./music-scene.js";
import GlowScene from "./glow-scene.js";
import Tile from "./tile.js";

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
            if (this.stream) {
                this.scene = new MusicScene(this.stream);
            }
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