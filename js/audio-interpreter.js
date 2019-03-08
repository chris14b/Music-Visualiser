import TileHandler from "./tile-handler.js";
import DiamondTile from "./diamond-tile.js";

const FFT_SIZE = 2048;
const NUM_FREQUENCY_BINS = FFT_SIZE / 2;
const NUM_TILE_GROUPS = 6;
const MAX_HUE = 360;
const FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
const HUE_INCREMENT_PER_SECOND = 6; // hue range will shift by this amount every frame
const MIN_ALPHA = 0;
const MAX_ALPHA = 100;
const QUIET_TIME_THRESHOLD = 0.5; // seconds of quiet, after which colour will change
const RESET_VALUES_TIME_THRESHOLD = 1;
const SMOOTHING_TIME_CONSTANT = 0.97;
const SILENT_THRESHOLD = 0;
const FPS = 30;
const TILE_MARGIN = 1;
const NUM_TILE_STYLES = 5;

export default class AudioInterpreter {
    constructor(stream) {
        this.tileStyle = 1;
        document.getElementById ("style").addEventListener ("click", this.changeStyle.bind(this), false);
        const audio = document.getElementById("audio");
        audio.crossOrigin = "anonymous";
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvasContext = this.canvas.getContext("2d");
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const tiles = this.createDiamondTiles(this.canvas, this.canvasContext);
        this.tileHandler = new TileHandler(tiles);

        this.audioContext = new AudioContext();
        this.audioStream = this.audioContext.createMediaStreamSource( stream );
        this.analyser = this.audioContext.createAnalyser();
        this.audioStream.connect(this.analyser);
        this.analyser.fftSize = FFT_SIZE;
        this.analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;

        this.frequencyBins = new Uint8Array(NUM_FREQUENCY_BINS);
        this.hueStart = Math.random() * MAX_HUE;
        this.averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        this.frameCount = 0;
        this.maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        this.darkFrameCount = Number.MAX_SAFE_INTEGER;
        this.silentFrameCount = Number.MAX_SAFE_INTEGER;
        this.frameInterval = 1000 / FPS;
        this.then = window.performance.now();

        this.renderFrame();
    }

    renderFrame() {
        requestAnimationFrame(this.renderFrame.bind(this));
        const now = window.performance.now();
        const elapsed = now - this.then;

        if (elapsed >= this.frameInterval) {
            this.then = now - (elapsed % this.frameInterval);
            this.canvasContext.fillStyle = "black";
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
            let darkFrame = true;
            this.frameCount++;
            let frameAverageIntensity = 0;
            this.analyser.getByteFrequencyData(this.frequencyBins);
            let tileGroupBins = this.getTileBins(this.frequencyBins);

            for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                this.averageIntensities[i] += (tileGroupBins[i] - this.averageIntensities[i]) / this.frameCount;
                this.maxIntensities[i] = Math.max(this.maxIntensities[i], tileGroupBins[i]);
                const hue = this.incrementHue(this.hueStart, - i / (NUM_TILE_GROUPS - 1) * FRAME_HUE_RANGE);
                const alpha = this.scaleValue(tileGroupBins[i], this.averageIntensities[i], this.maxIntensities[i], MIN_ALPHA, MAX_ALPHA);
                this.tileHandler.drawHue(i, hue, alpha, this.tileStyle);
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
                    this.hueStart = this.incrementHue(this.hueStart, FRAME_HUE_RANGE * 1.5);
                }

                this.darkFrameCount = 0;
            }

            this.hueStart = this.incrementHue(this.hueStart, HUE_INCREMENT_PER_SECOND / FPS);
        }
    }

    changeStyle() {
        this.tileStyle = (this.tileStyle + 1) % NUM_TILE_STYLES;
        console.log(this.tileStyle);
    }

    incrementHue(hue, increment) {
        return ((hue + increment) % MAX_HUE + MAX_HUE) % MAX_HUE;
    }

    getTileBins(frequencyBins) {
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

    scaleValue(value, minIn, maxIn, minOut, maxOut) {
        if (maxIn - minIn <= 0) {
            return 0;
        }

        return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, 0);
    }

    createDiamondTiles(canvas, canvasContext) {
        const tiles = [];
        const tileHeightPlusMargin = canvas.height / 2;
        const tileWidthPlusMargin = canvas.width / 6;
        const tileHeight = tileHeightPlusMargin - TILE_MARGIN * 2;
        const tileWidth = tileWidthPlusMargin - TILE_MARGIN * 2;

        for (let i = 0; i < 11; i++) {
            let id;

            if (i < 1 || i >= 10) {
                id = 5;
            } else if (i < 2 || i >= 9) {
                id = 4;
            } else if (i < 3 || i >= 8) {
                id = 3;
            } else if (i < 4 || i >= 7) {
                id = 2;
            } else if (i < 5 || i >= 6) {
                id = 1;
            } else {
                id = 0;
            }

            const tileX = canvas.width / 6 / 2 * (i + 1);

            if (i % 2 === 0) {
                tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
            } else {
                tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height * 1 / 4, tileWidth, tileHeight));
                tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height * 3 / 4, tileWidth, tileHeight));
            }
        }

        return tiles;
    }
}