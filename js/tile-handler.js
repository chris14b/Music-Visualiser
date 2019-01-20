export default class TileHandler {
    constructor(tiles) {
        this.tiles = tiles;
    }

    drawHue(id, hue, alpha) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.drawHue(hue, alpha);
            }
        });
    }

    drawRGBA(id, red, green, blue, alpha) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.drawRGBA(red, green, blue, alpha);
            }
        });
    }
}