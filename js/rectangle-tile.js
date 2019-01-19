import Tile from './tile.js';

export default class RectangleTile extends Tile {
    constructor(context, x, y, width, height) {
        super(context, x, y, width, height);
    }

    draw(hue, alpha) {
        this.setFillStyle(hue, alpha);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}