import MusicScene from "./music-scene.js";
import GlowScene from "./glow-scene.js";
import Tile from "./tile.js";

export default class SceneHandler {
    static MUSIC = 0;
    static GLOW = 1;
    static DEFAULT = SceneHandler.MUSIC;

    select(sceneType) {
        if (this.scene) {
            this.scene.stop = true;
        }

        if (sceneType === SceneHandler.MUSIC) {
            this.scene = new MusicScene();
        } else if (sceneType === SceneHandler.GLOW) {
            this.scene = new GlowScene();
        }

        this.scene.start();
    }

    incrementStyle() {
        this.scene.tileStyle = (this.scene.tileStyle + 1) % Tile.NUM_STYLES;
    }
}