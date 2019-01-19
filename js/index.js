import RectangleTile from "./rectangle-tile.js";
import DiamondTile from "./diamond-tile.js";

const NUM_FREQUENCY_BINS = 16;
const NUM_TILES = NUM_FREQUENCY_BINS;
const SILENT_THRESHOLD = 50; // if intensity drops below this, colour will change
const MAX_HUE = 360;
const FRAME_HUE_RANGE = 90; // range of hues to be shown at any one time
const HUE_INCREMENT = 0.1; // hue range will shift by this amount every frame
const MIN_ALPHA = 0;
const MAX_ALPHA = 100;
const DIAMOND_RATIO = 0.7; // width to height ratio
const USABLE_HEIGHT_RATIO = 0.8; // percentage of canvas height to use

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
  const tiles = setDiamondTiles(canvas, canvasContext);
  // const tiles = setRectangleTiles(canvas, canvasContext);

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
    const dataArray = new Uint8Array(NUM_FREQUENCY_BINS);
    let bin1Hue = Math.random() * MAX_HUE;
    let averageIntensities = [];
    let averageIntensitiesCount = 0;
    let maxIntensities = [];

    for (let i = 0; i < NUM_TILES; i++) {
      averageIntensities.push(0);
      maxIntensities.push(0);
    }

    let canChangeColour = false;

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);
      canvasContext.fillStyle = "black";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      let totalFrameIntensity = 0;
      averageIntensitiesCount++;

      for (let i = 0; i < NUM_TILES; i++) {
        averageIntensities[i] += (dataArray[i] - averageIntensities[i]) / averageIntensitiesCount;
        maxIntensities[i] = Math.max(maxIntensities[i], dataArray[i]);
        totalFrameIntensity += dataArray[i];

        const hue = (i / NUM_TILES * FRAME_HUE_RANGE + bin1Hue) % MAX_HUE;
        const alpha = scaleValue(dataArray[i], averageIntensities[i], maxIntensities[i], MIN_ALPHA, MAX_ALPHA);
        tiles[i].draw(hue, alpha);
      }

      const averageFrameIntensity = totalFrameIntensity / NUM_TILES;

      if (averageFrameIntensity < SILENT_THRESHOLD && canChangeColour) {
        bin1Hue = (bin1Hue + Math.random() * (MAX_HUE - 90) + FRAME_HUE_RANGE) % MAX_HUE;
        canChangeColour = false;
      } else {
        canChangeColour = true;
        bin1Hue = (bin1Hue + HUE_INCREMENT) % MAX_HUE;
      }
    }

    audio.play();
    renderFrame();
  };
};

function scaleValue(value, minIn, maxIn, minOut, maxOut) {
  return Math.max((value - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, 0);
}

function setRectangleTiles(canvas, canvasContext) {
  const tiles = [];

  for (let i = 0; i < NUM_TILES; i++) {
    const tileWidth = canvas.width / NUM_TILES;
    const tileX = tileWidth * i;
    tiles.push(new RectangleTile(canvasContext, tileX, tileWidth * 2, tileWidth, canvas.height - tileWidth * 4));
  }

  return tiles;
}

function setDiamondTiles(canvas, canvasContext) {
  const tiles = [];
  const tileHeight = canvas.height * USABLE_HEIGHT_RATIO / 2;
  const tileWidth = tileHeight * DIAMOND_RATIO;

  for (let i = 0; i < 12; i++) {
    const tileX = canvas.width / 2 - tileWidth * 3 + tileWidth / 2 * i;

    if (i % 2 === 0) {
      tiles.push(new DiamondTile(canvasContext, tileX, canvas.height / 2 - tileHeight / 2, tileWidth, tileHeight));
    } else {
      tiles.push(new DiamondTile(canvasContext, tileX, canvas.height / 2 - tileHeight, tileWidth, tileHeight));
      tiles.push(new DiamondTile(canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
    }
  }

  return tiles;
}