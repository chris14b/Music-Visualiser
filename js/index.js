import TileHandler from "./tile-handler.js";
import RectangleTile from "./rectangle-tile.js";
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
const SMOOTHING_TIME_CONSTANT = 0.95;
const SILENT_THRESHOLD = 0;
const FPS = 30;
const TILE_MARGIN = 1;
const NUM_TILE_STYLES = 5;

window.onload = function() {
    this.tileStyle = 1;
    document.getElementById ("style").addEventListener ("click", changeStyle, false);
    const audio = document.getElementById("audio");
    audio.crossOrigin = "anonymous";
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const canvasContext = canvas.getContext("2d");
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    const tiles = createDiamondTiles(canvas, canvasContext);
    const tileHandler = new TileHandler(tiles);

    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const audioContext = new AudioContext();
        const audioStream = audioContext.createMediaStreamSource( stream );
        const analyser = audioContext.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;

        const frequencyBins = new Uint8Array(NUM_FREQUENCY_BINS);
        let hueStart = Math.random() * MAX_HUE;
        let averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        let frameCount = 0;
        let maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        let darkFrameCount = Number.MAX_SAFE_INTEGER;
        let silentFrameCount = Number.MAX_SAFE_INTEGER;
        let tileStyle = 0;

        const frameInterval = 1000 / FPS;
        let then = window.performance.now();

        renderFrame();

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            const now = window.performance.now();
            const elapsed = now - then;

            if (elapsed >= frameInterval) {
                then = now - (elapsed % frameInterval);
                analyser.getByteFrequencyData(frequencyBins);
                canvasContext.fillStyle = "black";
                canvasContext.fillRect(0, 0, canvas.width, canvas.height);
                let darkFrame = true;
                frameCount++;
                let tileGroupBins = getTileBins(frequencyBins);
                let frameAverageIntensity = 0;

                for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                    averageIntensities[i] += (tileGroupBins[i] - averageIntensities[i]) / frameCount;
                    maxIntensities[i] = Math.max(maxIntensities[i], tileGroupBins[i]);
                    const hue = incrementHue(hueStart, - i / (NUM_TILE_GROUPS - 1) * FRAME_HUE_RANGE);
                    const alpha = scaleValue(tileGroupBins[i], averageIntensities[i], maxIntensities[i], MIN_ALPHA, MAX_ALPHA);
                    tileHandler.drawHue(i, hue, alpha, window.tileStyle);
                    darkFrame = darkFrame && alpha === 0;
                    frameAverageIntensity += (tileGroupBins[i] - frameAverageIntensity) / (i + 1);
                }

                if (frameAverageIntensity <= SILENT_THRESHOLD) {
                    silentFrameCount++;
                } else {
                    if (silentFrameCount >= FPS * RESET_VALUES_TIME_THRESHOLD) {
                        averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
                        frameCount = 0;
                        maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
                        console.info("Resetting values after", silentFrameCount, "silent frames.");
                    }

                    silentFrameCount = 0;
                }

                if (darkFrame) {
                    darkFrameCount++;
                } else {
                    if (darkFrameCount >= FPS * QUIET_TIME_THRESHOLD) {
                        hueStart = incrementHue(hueStart, FRAME_HUE_RANGE * 1.5);
                    }

                    darkFrameCount = 0;
                }

                hueStart = incrementHue(hueStart, HUE_INCREMENT_PER_SECOND / FPS);
            }
        }


    }

    function soundNotAllowed(error) {
        console.log(error);
    }

    function changeStyle() {
        window.tileStyle = (window.tileStyle + 1) % NUM_TILE_STYLES;
        console.log(window.tileStyle);
    }
};

function incrementHue(hue, increment) {
    return ((hue + increment) % MAX_HUE + MAX_HUE) % MAX_HUE;
}

function getTileBins(frequencyBins) {
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

function scaleValue(value, minIn, maxIn, minOut, maxOut) {
    if (maxIn - minIn <= 0) {
        return 0;
    }

    return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, 0);
}

function createDiamondTiles(canvas, canvasContext) {
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