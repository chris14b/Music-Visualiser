import TileHandler from "./tile-handler.js";
import Tile from "./tile.js";

export default class Scene {
    static FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
    static FPS = 30;
    static BACKGROUND_COLOUR = "black";
    static HUE_INCREMENT_PER_SECOND = 6; // hue range will shift by this amount every frame
    static MAX_HUE = 360;
    static FRAME_INTERVAL = 1000 / Scene.FPS;

    constructor() {
        // initialise canvas
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvasContext = this.canvas.getContext("2d");

        // initialise tiles
        this.tileHandler = new TileHandler();
        this.tileHandler.createDiamondTiles(this.canvas, this.canvasContext);
        this.tileStyle = Tile.DEFAULT_STYLE;

        this.stop = true;
    }

    static incrementHue(hue, increment) {
        return ((hue + increment) % Scene.MAX_HUE + Scene.MAX_HUE) % Scene.MAX_HUE;
    }
}