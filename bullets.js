class bullet{
    constructor(position, color, velocity) {
        this.pos = position;
        this.color = color
        this.vel = velocity
        this.radius = 5;
    }

    updatePosition(){
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
}

module.exports = {
    bullet,
}