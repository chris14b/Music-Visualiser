import TileHandler from "./tile-handler.js";
import RectangleTile from "./rectangle-tile.js";
import DiamondTile from "./diamond-tile.js";

const NUM_FREQUENCY_BINS = 16;
const NUM_TILES = NUM_FREQUENCY_BINS;
const NUM_TILE_GROUPS = 6;
const MAX_HUE = 360;
const FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
const HUE_INCREMENT = 0.1; // hue range will shift by this amount every frame
const MIN_ALPHA = 0;
const MAX_ALPHA = 100;
const DIAMOND_RATIO = 0.7; // width to height ratio
const USABLE_HEIGHT_RATIO = 0.8; // percentage of canvas height to use
const COLOUR_CHANGE_NUM_DARK_FRAMES = 10;
const SMOOTHING_TIME_CONSTANT = 0.95;

window.onload = function() {
    const file = document.getElementById("file");
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
    const colours = [[22, 29, 46],
                     [44, 199, 211],
                     [29, 116, 156],
                     [197, 200, 204],
                     [117, 43, 91],
                     [237, 122, 104]];

    file.onchange = function() {
        const files = this.files;
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = NUM_FREQUENCY_BINS * 2;
        analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
        const frequencyBins = new Uint8Array(NUM_FREQUENCY_BINS);
        let bin1Hue = Math.random() * MAX_HUE;
        let averageIntensities = [];
        let averageIntensitiesCount = 0;
        let maxIntensities = [];

        for (let i = 0; i < NUM_TILE_GROUPS; i++) {
            averageIntensities.push(0);
            maxIntensities.push(0);
        }

        let darkFrameCount = 0;

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(frequencyBins);
            canvasContext.fillStyle = "black";
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            let totalAlpha = 0;
            averageIntensitiesCount++;
            let tileGroupBins = getTileBins(frequencyBins);

            for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                averageIntensities[i] += (tileGroupBins[i] - averageIntensities[i]) / averageIntensitiesCount;
                maxIntensities[i] = Math.max(maxIntensities[i], tileGroupBins[i]);

                const hue = (i / NUM_TILE_GROUPS * FRAME_HUE_RANGE + bin1Hue) % MAX_HUE;
                const alpha = scaleValue(tileGroupBins[i], averageIntensities[i], maxIntensities[i], MIN_ALPHA, MAX_ALPHA);

                if (!isNaN(alpha)) {
                    totalAlpha += alpha;
                }

                tileHandler.drawHue(i, hue, alpha);
                // tileHandler.drawRGBA(i, colours[i][0], colours[i][1], colours[i][2], alpha);
            }

            if (totalAlpha === MIN_ALPHA * NUM_TILE_GROUPS) {
                darkFrameCount++;
            } else {
                darkFrameCount = 0;
            }

            if (darkFrameCount === COLOUR_CHANGE_NUM_DARK_FRAMES) {
                bin1Hue = (bin1Hue + FRAME_HUE_RANGE * 1.5) % MAX_HUE;
            } else {
                bin1Hue = (bin1Hue + HUE_INCREMENT) % MAX_HUE;
            }
        }

        audio.play();
        renderFrame();
    };
};

function getTileBins(frequencyBins) {
    let tileGroupBins = [];

    for (let i = 0; i < NUM_TILE_GROUPS; i++) {
        tileGroupBins.push(0);
        const minBin = i / NUM_TILE_GROUPS * NUM_FREQUENCY_BINS;
        const maxBin = (i + 1) / NUM_TILE_GROUPS * NUM_FREQUENCY_BINS;

        for (let j = 0; j < NUM_FREQUENCY_BINS; j++) {
            let lowerThreshold;
            let upperThreshold;

            if (minBin < j) {
                lowerThreshold = 0;
            } else if (minBin > j + 1) {
                lowerThreshold = 1;
            } else {
                lowerThreshold  = minBin - j;
            }

            if (maxBin < j) {
                upperThreshold = 0;
            } else if (maxBin > j + 1) {
                upperThreshold = 1;
            } else {
                upperThreshold = maxBin - j;
            }

            const amount = upperThreshold - lowerThreshold;
            tileGroupBins[i] += frequencyBins[j] * amount;
        }

        tileGroupBins[i] *= NUM_TILE_GROUPS / NUM_FREQUENCY_BINS;
    }

    return tileGroupBins;
}

function scaleValue(value, minIn, maxIn, minOut, maxOut) {
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