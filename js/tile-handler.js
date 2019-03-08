import DiamondTile from "./diamond-tile.js";

const TILE_MARGIN = 1;

export default class TileHandler {
    constructor() {
        this.tiles = [];
    }

    show(id, hue, intensity, style) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.show(hue, intensity, style);
            }
        });
    }

    createDiamondTiles(canvas, canvasContext) {
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
                this.tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
            } else {
                this.tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height * 1 / 4, tileWidth, tileHeight));
                this.tiles.push(new DiamondTile(id, canvasContext, tileX, canvas.height * 3 / 4, tileWidth, tileHeight));
            }
        }

        return this.tiles;
    }
}