import Scene from "./scene.js"

export default class GlowScene extends Scene {
    static AV_CYCLE_LENGTH = 20;
    static CYCLE_RANGE = 20;

    constructor() {
        super();
    }

    start() {
        this.stop = false;
        this.hueStart = Math.random() * Scene.MAX_HUE;
        this.frameCount = 0;
        this.tileRandoms = [this.tileHandler.numTiles];

        for (let i = 0; i < this.tileHandler.numTiles; i++) {
            this.tileRandoms[i] = [Math.random(), Math.random(), Math.random()];
        }

        this.render();
    }

    render() {
        this.canvasContext.fillStyle = Scene.BACKGROUND_COLOUR;
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.tileHandler.numTiles; i++) {
            const hue = this.hueStart + Scene.FRAME_HUE_RANGE * this.tileRandoms[i][0];
            const cycleLength = GlowScene.AV_CYCLE_LENGTH - GlowScene.CYCLE_RANGE / 2 + GlowScene.CYCLE_RANGE * this.tileRandoms[i][2];
            const intensity = Math.abs((this.frameCount / Scene.FPS % cycleLength / cycleLength + 1 / 2) % 1 * 2 - 1);
            this.tileHandler.showIndividual(i, hue, intensity, this.tileStyle);
        }

        this.hueStart = Scene.incrementHue(this.hueStart, Scene.HUE_INCREMENT_PER_SECOND / Scene.FPS);
        this.frameCount++;

        if (!this.stop) {
            requestAnimationFrame(this.render.bind(this));
        }
    }
}