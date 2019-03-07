export default class Tile {
    constructor(id, context, x, y, width, height) {
        this.id = id;
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setHue(hue, intensity) {
        this.context.fillStyle = "hsla(" + hue + ", 100%, 50%, " + intensity + "%)";
    }

    setRGBA(red, green, blue, intensity) {
        this.context.fillStyle = "rgba(" + red + ", " + green + ", " + blue + ", " + intensity + "%)";
    }
}