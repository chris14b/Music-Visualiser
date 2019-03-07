import Tile from './tile.js';

export default class DiamondTile extends Tile {
    constructor(id, context, x, y, width, height) {
        super(id, context, x, y, width, height);
    }

    drawHue(hue, alpha) {
        this.context.beginPath();
        this.context.moveTo(this.x + this.width / 2, this.y + this.height / 8 * (1 - alpha / 100));
        this.context.lineTo(this.x + this.width * 7 / 8 + this.width / 8 * alpha / 100, this.y + this.height / 2);
        this.context.lineTo(this.x + this.width / 2, this.y + this.height * 7 / 8 + this.height / 8 * alpha / 100);
        this.context.lineTo(this.x + this.width / 8 * (1 - alpha / 100),this.y + this.height / 2);
        this.setHue(hue, alpha);
        this.context.closePath();
        this.context.fill();
    }

    drawRGBA(red, green, blue, alpha) {
        this.context.beginPath();
        this.context.moveTo(this.x + this.width / 2, this.y);
        this.context.lineTo(this.x + this.width, this.y + this.height / 2);
        this.context.lineTo(this.x + this.width / 2, this.y + this.height);
        this.context.lineTo(this.x,this.y + this.height / 2);
        this.setRGBA(red, green, blue, alpha);
        this.context.closePath();
        this.context.fill();
    }
}