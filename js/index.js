import TileHandler from "./tile-handler.js";
import RectangleTile from "./rectangle-tile.js";
import DiamondTile from "./diamond-tile.js";

const NUM_FREQUENCY_BINS = 16;
const NUM_TILES = NUM_FREQUENCY_BINS;
const NUM_TILE_GROUPS = 6;
const MAX_HUE = 360;
const FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
const HUE_INCREMENT_PER_SECOND = 6; // hue range will shift by this amount every frame
const MIN_ALPHA = 0;
const MAX_ALPHA = 100;
const DIAMOND_RATIO = 0.59; // width to height ratio
const USABLE_HEIGHT_RATIO = 0.98; // percentage of canvas height to use
const QUIET_TIME_THRESHOLD = 0.5; // seconds of quiet, after which colour will change
const RESET_VALUES_TIME_THRESHOLD = 1;
const SMOOTHING_TIME_CONSTANT = 0.95;
const SILENT_THRESHOLD = 20;
const FPS = 30;

window.onload = function() {
    const audio = document.getElementById("audio");
    audio.crossOrigin = "anonymous";
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const canvasContext = canvas.getContext("2d");
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // const tiles = createDiamondTiles(canvas, canvasContext);
    const tiles = createGroupDiamondTiles2(canvas, canvasContext);
    // const tiles = createRectangleTiles(canvas, canvasContext);

    const tileHandler = new TileHandler(tiles);

    navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);

    function soundAllowed(stream) {
        const audioContext = new AudioContext();
        const audioStream = audioContext.createMediaStreamSource( stream );
        const analyser = audioContext.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = NUM_FREQUENCY_BINS * 2;
        analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
        const frequencyBins = new Uint8Array(NUM_FREQUENCY_BINS);
        let hueStart = Math.random() * MAX_HUE;
        let averageIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        let frameCount = 0;
        let maxIntensities = new Array(NUM_TILE_GROUPS).fill(0);
        let darkFrameCount = Number.MAX_SAFE_INTEGER;
        let silentFrameCount = Number.MAX_SAFE_INTEGER;

        const frameInterval = 1000 / FPS;
        let then = window.performance.now();

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            let now = window.performance.now();
            let elapsed = now - then;

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
                    tileHandler.drawHue(i, hue, alpha);

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
                        hueStart = incrementHue(hueStart, - FRAME_HUE_RANGE * 1.5);
                    }

                    darkFrameCount = 0;
                }

                hueStart = incrementHue(hueStart, HUE_INCREMENT_PER_SECOND / FPS);
            }
        }

        renderFrame();
    }

    function soundNotAllowed(error) {
        console.log(error);
    }
};

function incrementHue(hue, increment) {
    return ((hue + increment) % MAX_HUE + MAX_HUE) % MAX_HUE;
}

function getTileBins(frequencyBins) {
    let tileGroupBins = [];

    for (let i = 0; i < NUM_TILE_GROUPS; i++) {
        tileGroupBins.push(0);
        const minBin = i / NUM_TILE_GROUPS * NUM_FREQUENCY_BINS;
        const maxBin = (i + 1) / NUM_TILE_GROUPS * NUM_FREQUENCY_BINS;

        for (let j = Math.floor(minBin); j < Math.ceil(maxBin); j++) {
            const lowerThreshold = Math.max(0, minBin - j);
            const upperThreshold = Math.min(maxBin - j, 1);
            const amount = upperThreshold - lowerThreshold;
            tileGroupBins[i] += frequencyBins[j] * amount;
        }

        tileGroupBins[i] *= NUM_TILE_GROUPS / NUM_FREQUENCY_BINS;
    }

    return tileGroupBins;
}

function scaleValue(value, minIn, maxIn, minOut, maxOut) {
    if (maxIn - minIn <= 0) {
        return 0;
    }

    return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, 0);
}

function createRectangleTiles(canvas, canvasContext) {
    const tiles = [];

    for (let i = 0; i < NUM_TILES; i++) {
        const tileWidth = canvas.width / NUM_TILES;
        const tileX = tileWidth * i;
        tiles.push(new RectangleTile(i, canvasContext, tileX, tileWidth * 2, tileWidth, canvas.height - tileWidth * 4));
    }

    return tiles;
}

function createDiamondTiles(canvas, canvasContext) {
    const tiles = [];
    const tileHeight = canvas.height * USABLE_HEIGHT_RATIO / 2;
    const tileWidth = tileHeight * DIAMOND_RATIO;
    let tileNum = 0;

    for (let i = 0; i < 11; i++) {
        const tileX = canvas.width / 2 - tileWidth * 3 + tileWidth / 2 * i;

        if (i % 2 === 0) {
            tiles.push(new DiamondTile(tileNum, canvasContext, tileX, canvas.height / 2 - tileHeight / 2, tileWidth, tileHeight));
        } else {
            tiles.push(new DiamondTile(tileNum, canvasContext, tileX, canvas.height / 2 - tileHeight, tileWidth, tileHeight));
            tileNum++;
            tiles.push(new DiamondTile(tileNum, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
        }

        tileNum++;
    }

    return tiles;
}

function createGroupDiamondTiles(canvas, canvasContext) {
    const tiles = [];
    const tileHeight = canvas.height * USABLE_HEIGHT_RATIO / 2;
    const tileWidth = tileHeight * DIAMOND_RATIO;

    for (let i = 0; i < 11; i++) {
        let id;

        if (i < 2) {
            id = 3;
        } else if (i < 4) {
            id = 2;
        } else if (i < 5) {
            id = 1;
        } else if (i < 6) {
            id = 0;
        } else if (i < 7) {
            id = 1;
        } else if (i < 9) {
            id = 2;
        } else {
            id = 3;
        }

        const tileX = canvas.width / 2 - tileWidth * 3 + tileWidth / 2 * i;

        if (i % 2 === 0) {
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2 - tileHeight / 2, tileWidth, tileHeight));
        } else {
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2 - tileHeight, tileWidth, tileHeight));
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
        }
    }

    return tiles;
}

function createGroupDiamondTiles2(canvas, canvasContext) {
    const tiles = [];
    const tileHeight = canvas.height * USABLE_HEIGHT_RATIO / 2;
    const tileWidth = tileHeight * DIAMOND_RATIO;

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

        const tileX = canvas.width / 2 - tileWidth * 3 + tileWidth / 2 * i;

        if (i % 2 === 0) {
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2 - tileHeight / 2, tileWidth, tileHeight));
        } else {
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2 - tileHeight, tileWidth, tileHeight));
            tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
        }
    }

    return tiles;
}