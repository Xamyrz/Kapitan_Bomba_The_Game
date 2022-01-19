const { bullet } = require('./bullets');

class weapon{
    constructor(player){
        this.pos = {x: (player.w/2)+player.pos.x, y: player.h+player.pos.y}
        this.prevXY = {y: null, x: null};
        this.rotation = 3.14159265;
        this.joystick = {x: 50, y:100}

        this.bullets = [];
    }

    weaponRotate(joystick){
        this.joystick = {x: joystick.x, y: joystick.y}
        if(this.prevXY.y != joystick.y || this.prevXY.x != joystick.x && (this.prevXY.y != null || this.prevXY.x != null)) {
        
        var diffX = 100 - joystick.x;
        var diffY = 100 - joystick.y;
        var tan = diffY / diffX;
        var atan = Math.atan(tan)
        if(isNaN(atan)) atan = 3.14159265;
        if(diffY > 0 && diffX > 0) {
        
            atan -= 3.14159265; 
        }
        else if(diffY < 0 && diffX > 0) {
        
            atan += 3.14159265;
        }
        this.prevXY.x = joystick.x;
        this.prevXY.y = joystick.y;
        this.rotation = atan;
        }
    }

    shoot(){
        const angle = Math.atan2(this.joystick.y - 100, this.joystick.x - 100)
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        this.bullets.push(new bullet(this, 'white', velocity))
    }
}

module.exports = {
    weapon,
}