export default class Tile {
    constructor(context, x, y, width, height) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setFillStyle(hue, alpha) {
        this.context.fillStyle = "hsla(" + hue + ", 100%, 50%, " + alpha + "%)";
    }
}