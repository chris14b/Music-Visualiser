import Tile from './tile.js';

const NORMAL = 0;
const PULSE = 1;
const MELT = 2;
const CHIRP = 3;
const EXTEND = 4;
const DEFAULT_STYLE = PULSE;

export default class DiamondTile extends Tile {
    constructor(id, context, x, y, width, height) {
        super(id, context, x, y, width, height);
    }

    drawHue(hue, intensity, style = DEFAULT_STYLE) {
        this.outlineDiamond(intensity, style);
        this.setHue(hue, intensity);
        this.context.fill();
    }

    drawRGBA(red, green, blue, intensity, style = DEFAULT_STYLE) {
        this.outlineDiamond(intensity, style);
        this.setRGBA(red, green, blue, intensity);
        this.context.fill();
    }

    outlineDiamond(intensity, style) {
        this.context.beginPath();
        const intensityPercent = intensity / 100;

        if (style === PULSE) {
            this.context.moveTo(this.x, this.y - this.height * 3 / 8 - this.height / 8 * intensityPercent);
            this.context.lineTo(this.x + this.width * 3 / 8 + this.width / 8 * intensityPercent, this.y);
            this.context.lineTo(this.x, this.y + this.height * 3 / 8 + this.height / 8 * intensityPercent);
            this.context.lineTo(this.x - this.width * 3 / 8 - this.width / 8 * intensityPercent, this.y);
        } else if (style === MELT) {
            this.context.moveTo(this.x, this.y - this.height * 3 / 8 - this.height / 8 * intensityPercent);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height * 3 / 8 + this.height / 8 * (1 - intensityPercent));
            this.context.lineTo(this.x - this.width / 2, this.y);
        } else if (style === CHIRP) {
            this.context.moveTo(this.x, this.y + this.height * 3 / 8 - this.height * 7 / 8 * intensityPercent);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        } else if (style === EXTEND) {
            this.context.moveTo(this.x, (this.y - this.height / 2) * intensityPercent);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        } else {
            this.context.moveTo(this.x, this.y - this.height / 2);
            this.context.lineTo(this.x + this.width / 2, this.y);
            this.context.lineTo(this.x, this.y + this.height / 2);
            this.context.lineTo(this.x - this.width / 2,this.y);
        }

        this.context.closePath();
    }
}