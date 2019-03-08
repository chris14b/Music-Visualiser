import DiamondTile from "./diamond-tile.js";

const TILE_MARGIN = 1;

export default class TileHandler {
    constructor() {
        this.tiles = [];
        this.numTiles = 0;
        this.numTileGroups = 0;
    }

    showIndividual(id, hue, intensity, style) {
        this.tiles[id].show(hue, intensity, style);
    }

    showGroup(groupId, hue, intensity, style) {
        this.tiles.forEach(function(tile) {
            if (tile.groupId === groupId) {
                tile.show(hue, intensity, style);
            }
        });
    }

    createDiamondTiles(canvas, canvasContext) {
        this.numTileGroups = 6;
        const tileHeightPlusMargin = canvas.height / 2;
        const tileWidthPlusMargin = canvas.width / 6;
        const tileHeight = tileHeightPlusMargin - TILE_MARGIN * 2;
        const tileWidth = tileWidthPlusMargin - TILE_MARGIN * 2;

        for (let i = 0; i < 11; i++) {
            let groupId;

            if (i < 1 || i >= 10) {
                groupId = 5;
            } else if (i < 2 || i >= 9) {
                groupId = 4;
            } else if (i < 3 || i >= 8) {
                groupId = 3;
            } else if (i < 4 || i >= 7) {
                groupId = 2;
            } else if (i < 5 || i >= 6) {
                groupId = 1;
            } else {
                groupId = 0;
            }

            const tileX = canvas.width / 6 / 2 * (i + 1);

            if (i % 2 === 0) {
                this.tiles.push(new DiamondTile(i, groupId, canvasContext, tileX, canvas.height / 2, tileWidth, tileHeight));
            } else {
                this.tiles.push(new DiamondTile(i, groupId, canvasContext, tileX, canvas.height * 1 / 4, tileWidth, tileHeight));
                this.tiles.push(new DiamondTile(i, groupId, canvasContext, tileX, canvas.height * 3 / 4, tileWidth, tileHeight));
            }
        }

        this.numTiles = this.tiles.length;
        return this.tiles;
    }
}