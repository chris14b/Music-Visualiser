import Tile from './tile.js';

export default class RectangleTile extends Tile {
    constructor(id, context, x, y, width, height) {
        super(id, context, x, y, width, height);
    }

    drawHue(hue, intensity) {
        this.setHue(hue, intensity);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    drawRGBA(red, green, blue, intensity) {
        this.setRGBA(red, green, blue, intensity);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}