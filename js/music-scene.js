import Scene from "./scene.js"

export default class MusicScene extends Scene {
    static DARK_TIME_THRESHOLD = 0.5; // seconds of quiet, after which colour will change
    static SMOOTHING_TIME_CONSTANT = 0.97;
    static SILENT_THRESHOLD = 0;
    static RESET_VALUES_TIME_THRESHOLD = 1;
    static FFT_SIZE = 2048;
    static NUM_FREQUENCY_BINS = MusicScene.FFT_SIZE / 2;

    constructor(stream) {
        super();
        const audioContext = new AudioContext();
        const audioStream = audioContext.createMediaStreamSource(stream);
        this.analyser = audioContext.createAnalyser();
        audioStream.connect(this.analyser);
        this.analyser.fftSize = MusicScene.FFT_SIZE;
        this.analyser.smoothingTimeConstant = MusicScene.SMOOTHING_TIME_CONSTANT;
    }

    start() {
        this.stop = false;
        this.frequencyBins = new Uint8Array(MusicScene.NUM_FREQUENCY_BINS);
        this.averageIntensities = new Array(this.tileHandler.numTileGroups).fill(0);
        this.maxIntensities = new Array(this.tileHandler.numTileGroups).fill(0);
        this.hueStart = Math.random() * Scene.MAX_HUE;
        this.darkFrameCount = Number.MIN_SAFE_INTEGER;
        this.silentFrameCount = Number.MAX_SAFE_INTEGER;
        this.frameCount = 0;
        this.render();
    }

    render() {
        this.canvasContext.fillStyle = Scene.BACKGROUND_COLOUR;
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let darkFrame = true;

        this.analyser.getByteFrequencyData(this.frequencyBins);
        let tileGroupBins = this.getTileBins(this.frequencyBins);

        const frameAverageIntensity = tileGroupBins.reduce(MusicScene.add) / this.tileHandler.numTileGroups;

        if (frameAverageIntensity <= MusicScene.SILENT_THRESHOLD) {
            this.silentFrameCount++;
        } else {
            if (this.silentFrameCount >= Scene.FPS * MusicScene.RESET_VALUES_TIME_THRESHOLD) {
                this.averageIntensities = new Array(this.tileHandler.numTileGroups).fill(0);
                this.frameCount = 0;
                this.maxIntensities = new Array(this.tileHandler.numTileGroups).fill(0);
                console.info("Resetting values after", this.silentFrameCount, "silent frames.");
            }

            this.silentFrameCount = 0;
        }

        this.frameCount++;

        for (let i = 0; i < this.tileHandler.numTileGroups; i++) {
            this.averageIntensities[i] += (tileGroupBins[i] - this.averageIntensities[i]) / this.frameCount;
            this.maxIntensities[i] = Math.max(this.maxIntensities[i], tileGroupBins[i]);
            const hue = Scene.incrementHue(this.hueStart, - i / (this.tileHandler.numTileGroups - 1) * Scene.FRAME_HUE_RANGE);
            const alpha = MusicScene.scaleValue(tileGroupBins[i], this.averageIntensities[i], this.maxIntensities[i], 0, 1);
            this.tileHandler.showGroup(i, hue, alpha, this.tileStyle);
            darkFrame = darkFrame && alpha === 0;
        }

        if (darkFrame) {
            this.darkFrameCount++;

            if (this.darkFrameCount === Math.ceil(Scene.FPS * MusicScene.DARK_TIME_THRESHOLD)) {
                this.hueStart = Scene.incrementHue(this.hueStart, Scene.FRAME_HUE_RANGE * 1.5);
                console.info("Incrementing hue after " + this.darkFrameCount + " dark frames.");
            }
        } else {
            this.darkFrameCount = 0;
        }

        this.hueStart = Scene.incrementHue(this.hueStart, Scene.HUE_INCREMENT_PER_SECOND / Scene.FPS);

        if (!this.stop) {
            requestAnimationFrame(this.render.bind(this));
        }
    }

    getTileBins(frequencyBins) {
        let tileGroupBins = [];

        for (let i = 0; i < this.tileHandler.numTileGroups; i++) {
            tileGroupBins.push(0);
            const minBin = (Math.pow(2, i) - 1) / (Math.pow(2, this.tileHandler.numTileGroups) - 1) * MusicScene.NUM_FREQUENCY_BINS;
            const maxBin = (Math.pow(2, i + 1) - 1) / (Math.pow(2, this.tileHandler.numTileGroups) - 1) * MusicScene.NUM_FREQUENCY_BINS;
            let numBins = 0;

            for (let j = Math.floor(minBin); j < Math.ceil(maxBin); j++) {
                const lowerThreshold = Math.max(0, minBin - j);
                const upperThreshold = Math.min(maxBin - j, 1);
                const amount = upperThreshold - lowerThreshold;
                tileGroupBins[i] += frequencyBins[j] * amount;
                numBins += amount;
            }

            tileGroupBins[i] /= numBins;
        }

        return tileGroupBins;
    }

    static scaleValue(value, minIn, maxIn, minOut, maxOut) {
        if (maxIn - minIn <= 0) {
            return minOut;
        }

        return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, minOut);
    }

    static add(x, y) {
        return x + y;
    }
}