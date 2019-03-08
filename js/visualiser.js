import TileHandler from "./tile-handler.js";
import Tile from "./tile.js";

// change whenever
const FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
const QUIET_TIME_THRESHOLD = 0.5; // seconds of quiet, after which colour will change
const SMOOTHING_TIME_CONSTANT = 0.97;
const SILENT_THRESHOLD = 0;
const FPS = 30;
const BACKGROUND_COLOUR = "black";
const HUE_INCREMENT_PER_SECOND = 6; // hue range will shift by this amount every frame
const RESET_VALUES_TIME_THRESHOLD = 1;

// change rarely
const FFT_SIZE = 2048;
const NUM_TILE_GROUPS = 6;

// never change
const NUM_FREQUENCY_BINS = FFT_SIZE / 2;
const MAX_HUE = 360;
const FRAME_INTERVAL = 1000 / FPS;

export default class Visualiser {
    static VISUALISATION = 0;
    static SINGLE_COLOUR  = 1;
    static DEFAULT_MODE = Visualiser.VISUALISATION;

    constructor(stream) {
        // initialise canvas
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvasContext = this.canvas.getContext("2d");

        // initialise tiles
        this.tileHandler = new TileHandler();
        this.tileHandler.createDiamondTiles(this.canvas, this.canvasContext);
        this.tileStyle = 1;

        // initialise audio analyser
        const audioContext = new AudioContext();
        const audioStream = audioContext.createMediaStreamSource( stream );
        this.analyser = audioContext.createAnalyser();
        audioStream.connect(this.analyser);
        this.analyser.fftSize = FFT_SIZE;
        this.analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
    }

    setMode(mode) {
        if (mode === Visualiser.VISUALISATION) {
            this.frequencyBins = new Uint8Array(NUM_FREQUENCY_BINS);
            this.averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
            this.maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
            this.hueStart = Math.random() * MAX_HUE;
            this.darkFrameCount = Number.MAX_SAFE_INTEGER;
            this.silentFrameCount = Number.MAX_SAFE_INTEGER;
            this.frameCount = 0;
            this.then = window.performance.now();
            this.renderVisualisation();
        } else if (mode === Visualiser.SINGLE_COLOUR) {
            this.canvasContext.fillStyle = BACKGROUND_COLOUR;
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                this.tileHandler.show(i, this.hueStart, 1, this.tileStyle);
            }
        } else {
            console.error("Invalid mode: " + mode);
        }
    }

    renderVisualisation() {
        const now = window.performance.now();
        const elapsed = now - this.then;

        if (elapsed >= FRAME_INTERVAL) {
            this.then = now - (elapsed % FRAME_INTERVAL);

            this.canvasContext.fillStyle = BACKGROUND_COLOUR;
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

            let darkFrame = true;
            this.frameCount++;
            let frameAverageIntensity = 0;

            let tileGroupBins = Visualiser.getTileBins(this.frequencyBins);
            this.analyser.getByteFrequencyData(this.frequencyBins);

            for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                this.averageIntensities[i] += (tileGroupBins[i] - this.averageIntensities[i]) / this.frameCount;
                this.maxIntensities[i] = Math.max(this.maxIntensities[i], tileGroupBins[i]);
                const hue = Visualiser.incrementHue(this.hueStart, -i / (NUM_TILE_GROUPS - 1) * FRAME_HUE_RANGE);
                const alpha = Visualiser.scaleValue(tileGroupBins[i], this.averageIntensities[i], this.maxIntensities[i], 0, 1);
                this.tileHandler.show(i, hue, alpha, this.tileStyle);
                darkFrame = darkFrame && alpha === 0;
                frameAverageIntensity += (tileGroupBins[i] - frameAverageIntensity) / (i + 1);
            }

            if (frameAverageIntensity <= SILENT_THRESHOLD) {
                this.silentFrameCount++;
            } else {
                if (this.silentFrameCount >= FPS * RESET_VALUES_TIME_THRESHOLD) {
                    this.averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
                    this.frameCount = 0;
                    this.maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
                    console.info("Resetting values after", this.silentFrameCount, "silent frames.");
                }

                this.silentFrameCount = 0;
            }

            if (darkFrame) {
                this.darkFrameCount++;
            } else {
                if (this.darkFrameCount >= FPS * QUIET_TIME_THRESHOLD) {
                    this.hueStart = Visualiser.incrementHue(this.hueStart, FRAME_HUE_RANGE * 1.5);
                }

                this.darkFrameCount = 0;
            }

            this.hueStart = Visualiser.incrementHue(this.hueStart, HUE_INCREMENT_PER_SECOND / FPS);
        }

        requestAnimationFrame(this.renderVisualisation.bind(this));

    }

    changeStyle() {
        this.tileStyle = (this.tileStyle + 1) % Tile.NUM_STYLES;
    }

    static incrementHue(hue, increment) {
        return ((hue + increment) % MAX_HUE + MAX_HUE) % MAX_HUE;
    }

    static getTileBins(frequencyBins) {
        let tileGroupBins = [];

        for (let i = 0; i < NUM_TILE_GROUPS; i++) {
            tileGroupBins.push(0);
            const minBin = (Math.pow(2, i) - 1) / (Math.pow(2, NUM_TILE_GROUPS) - 1) * NUM_FREQUENCY_BINS;
            const maxBin = (Math.pow(2, i + 1) - 1) / (Math.pow(2, NUM_TILE_GROUPS) - 1) * NUM_FREQUENCY_BINS;
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
            return 0;
        }

        return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, 0);
    }
}