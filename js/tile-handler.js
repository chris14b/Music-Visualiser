export default class TileHandler {
    constructor(tiles) {
        this.tiles = tiles;
    }

    draw(id, hue, alpha) {
        this.tiles.forEach(function(tile) {
            if (tile.id === id) {
                tile.draw(hue, alpha);
            }
        });
    }
}