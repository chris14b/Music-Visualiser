export default class Tile {
    constructor(id, context, x, y, width, height) {
        this.id = id;
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setHue(hue, alpha) {
        this.context.fillStyle = "hsla(" + hue + ", 100%, 50%, " + alpha + "%)";
    }

    setRGBA(red, green, blue, alpha) {
        this.context.fillStyle = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + "%)";
    }
}