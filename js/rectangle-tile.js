import Tile from './tile.js';

export default class RectangleTile extends Tile {
    constructor(id, context, x, y, width, height) {
        super(id, context, x, y, width, height);
    }

    drawHue(hue, alpha) {
        this.setHue(hue, alpha);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    drawRGBA(red, green, blue, alpha) {
        this.setRGBA(red, green, blue, alpha);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}