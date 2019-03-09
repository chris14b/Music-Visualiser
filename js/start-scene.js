import Scene from "./scene.js"

export default class StartScene extends Scene {
    static CYCLE_LENGTH = 1;
    static CYCLE_FRAMES = StartScene.CYCLE_LENGTH * Scene.FPS;

    constructor() {
        super();
    }

    start() {
        this.stop = false;
        this.frameCount = 0;

        this.render();
    }

    render() {
        this.canvasContext.fillStyle = Scene.BACKGROUND_COLOUR;
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.tileHandler.numTiles; i++) {
            const hue = i / this.tileHandler.numTiles * StartScene.MAX_HUE;
            const intensity = Math.max(- 2 * Math.abs(this.frameCount / StartScene.CYCLE_FRAMES - (i + 1) / this.tileHandler.numTiles - 1 / 2) + 1, 0);
            this.tileHandler.showIndividual(i, hue, intensity, this.tileStyle);
        }

        this.hueStart = Scene.incrementHue(this.hueStart, Scene.HUE_INCREMENT_PER_SECOND / Scene.FPS);
        this.frameCount++;

        if (!this.stop) {
            requestAnimationFrame(this.render.bind(this));
        }
    }
}