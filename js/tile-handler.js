export default class TileHandler {
    constructor(tiles) {
        this.tiles = tiles;
    }

    drawHue(id, hue, intensity, style) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.drawHue(hue, intensity, style);
            }
        });
    }

    drawRGBA(id, red, green, blue, intensity) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.drawRGBA(red, green, blue, intensity);
            }
        });
    }
}