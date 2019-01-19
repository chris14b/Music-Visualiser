import Tile from './tile.js';

export default class DiamondTile extends Tile {
    constructor(context, x, y, width, height) {

        super(context, x, y, width, height);
    }

    draw(hue, alpha) {
        this.context.beginPath();
        this.context.moveTo(this.x + this.width / 2, this.y);
        this.context.lineTo(this.x + this.width, this.y + this.height / 2);
        this.context.lineTo(this.x + this.width / 2, this.y + this.height);
        this.context.lineTo(this.x,this.y + this.height / 2);
        this.setFillStyle(hue, alpha);
        this.context.closePath();
        this.context.fill();
    }
}