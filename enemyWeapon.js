const { bullet } = require('./bullets');

class enemyWeapon{
    constructor(player){
        this.pos = {x: player.pos.x, y: player.pos.y+10}
        this.prevXY = {y: null, x: null};
        this.rotation = 3.14159265;
        this.joystick = {x: 50, y:100}

        this.shooting = false;
        this.bullets = [];
        this.fireCounter = 0;
    }

    shoot(player){
        const angle = Math.atan2(player.weapon.pos.y-this.pos.y, player.weapon.pos.x-this.pos.x);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const velocity = {
            x: cos * 5,
            y: sin * 5
        }
        this.bullets.push(new bullet(this, 'brown', velocity))
    }

}

module.exports = {
    enemyWeapon,
}