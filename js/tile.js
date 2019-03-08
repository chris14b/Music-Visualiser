export default class Tile {
    static NORMAL = 0;
    static PULSE = 1;
    static BOUNCE = 2;
    static FOLD = 3;
    static EXTEND = 4;
    static NUM_STYLES = 5;
    static DEFAULT_STYLE = Tile.PULSE;
    
    constructor(id, groupId, context, x, y, width, height) {
        this.id = id;
        this.groupId = groupId;
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setHue(hue, intensity) {
        this.context.fillStyle = "hsla(" + hue + ", 100%, 50%, " + intensity + ")";
    }
}