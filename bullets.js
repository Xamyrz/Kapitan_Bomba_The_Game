class bullet{
    constructor(weapon, color, velocity) {
        this.pos = weapon.pos
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