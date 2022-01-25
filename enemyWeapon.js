const { bullet } = require('./bullets');

class enemyWeapon{
    constructor(player){
        this.pos = {x: player.pos.x, y: player.pos.y+10}

        this.shooting = false;
        this.bullets = [];
    }

    shoot(player){
        const angle = Math.atan2(player.weapon.pos.y-this.pos.y-12.5, player.weapon.pos.x-this.pos.x-12.5);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const velocity = {
            x: cos * 5,
            y: sin * 5
        }
        let bulletPos = {x: this.pos.x+12.5, y: this.pos.y+12.5};
        this.bullets.push(new bullet(bulletPos, 'brown', velocity));
    }

}

module.exports = {
    enemyWeapon,
}