class bullet{
    constructor(player){
        this.pos = {x: (player.w/2)+player.pos.x, y: player.h+player.pos.y}
        this.prevXY = {y: null, x: null};
        this.rotation = 3.14159265;
    }
}

module.exports = {
    bullet,
}