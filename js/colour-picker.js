import RectangleTile from "./rectangle-tile.js";
import TileHandler from "./tile-handler.js";

const NUM_TILE_GROUPS = 5;

window.onload = function() {
    let imageLoader = document.getElementById('file');
    let tilesCanvas = document.getElementById('canvas');
    let tilesContext = tilesCanvas.getContext('2d');
    let imageCanvas = document.getElementById('image-canvas');
    let imageContext = imageCanvas.getContext('2d');
    const tiles = createRectangleTiles(tilesCanvas, tilesContext);
    const tileHandler = new TileHandler(tiles);

    imageLoader.onchange = function() {
        let reader = new FileReader();

        reader.onload = function(event) {
            let image = new Image();

            image.onload = function() {
                imageCanvas.width = image.width;
                imageCanvas.height = image.height;
                imageContext.drawImage(image,0,0);

                const colours = getColours(imageContext, image.width, image.height);

                for (let i = 0; i < NUM_TILE_GROUPS; i++) {
                    tileHandler.drawRGBA(i, colours[i][0], colours[i][1], colours[i][2], colours[i][3]);
                }
            };

            image.src = event.target.result;
        };

        reader.readAsDataURL(imageLoader.files[0]);
    };
};

function createRectangleTiles(canvas, canvasContext) {
    const tiles = [];

    for (let i = 0; i < NUM_TILE_GROUPS; i++) {
        const tileWidth = canvas.width / NUM_TILE_GROUPS;
        tiles.push(new RectangleTile(i, canvasContext, tileWidth * i, 0, tileWidth, canvas.height));
    }

    return tiles;
}

function getColours(image, width, height) {
    let colours = [];
    // let colourFrequencies = {};
    //
    // for (let x = 0; x < width; x++) {
    //     for (let y = 0; y < height; y++) {
    //         const currPixel = image.getImageData(x, y, 1, 1).data;
    //
    //         if (currPixel[0] + currPixel[1] + currPixel[2] >= 64 * 3) {
    //             if (currPixel in colourFrequencies) {
    //                 colourFrequencies[currPixel]++;
    //             } else {
    //                 colourFrequencies[currPixel] = 1;
    //             }
    //         }
    //     }
    // }
    //
    // for (let key in colourFrequencies) {
    //     console.log(key, colourFrequencies[key]);
    // }
    //
    // // Create items array
    // let items = Object.keys(colourFrequencies).map(function(key) {
    //     return [key, colourFrequencies[key]];
    // });
    //
    // // Sort the array based on the second element
    // items.sort(function(first, second) {
    //     return second[1] - first[1];
    // });
    //
    // // Create a new array with only the first 5 items
    // const top = items.slice(0, NUM_TILE_GROUPS);
    //
    // for (let i = 0; i < NUM_TILE_GROUPS; i++) {
    //     console.log(top[i]);
    //     colours[i] = top[i][0].split(",");
    //     console.log(colours[i]);
    // }

    for (let i = 0; i < NUM_TILE_GROUPS; i++) {
        colours[i] = image.getImageData(Math.random() * width, Math.random() * height, 1, 1).data;
    }

    return colours;
}