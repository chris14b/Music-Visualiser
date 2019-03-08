import Tile from './tile.js';

export default class DiamondTile extends Tile {
    constructor(id, context, x, y, width, height) {
        super(id, context, x, y, width, height);
    }

    show(hue, intensity, style = Tile.DEFAULT_STYLE) {
        this.outlineDiamond(intensity, style);
        this.setHue(hue, intensity);
        this.context.fill();
    }

    outlineDiamond(intensity, style) {
        this.context.beginPath();

        if (style === Tile.NORMAL) {
            this.context.moveTo(this.x, this.y - this.height / 2);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        } else if (style === Tile.PULSE) {
            this.context.moveTo(this.x, this.y - this.height * 3 / 8 - this.height / 8 * intensity);
            this.context.lineTo(this.x + this.width * 3 / 8 + this.width / 8 * intensity, this.y);
            this.context.lineTo(this.x, this.y + this.height * 3 / 8 + this.height / 8 * intensity);
            this.context.lineTo(this.x - this.width * 3 / 8 - this.width / 8 * intensity, this.y);
        } else if (style === Tile.BOUNCE) {
            this.context.moveTo(this.x, this.y - this.height / 4 - this.height / 4 * intensity);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 4 + this.height / 4 * (1 - intensity));
            this.context.lineTo(this.x - this.width / 2, this.y);
        } else if (style === Tile.FOLD) {
            this.context.moveTo(this.x, this.y + this.height * 3 / 8 - this.height * 7 / 8 * intensity);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        } else if (style === Tile.EXTEND) {
            this.context.moveTo(this.x, (this.y - this.height / 2) * intensity);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        } else {
            console.error("Invalid tile style: " + style);
        }

        this.context.closePath();
    }
}