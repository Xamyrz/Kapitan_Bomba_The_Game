class bullet{
    constructor(weapon, color, velocity) {
        this.pos = weapon.pos
        this.color = color
        this.vel = velocity
    }

    updatePosition(){
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        console.log(this.vel);
    }
}

module.exports = {
    bullet,
}