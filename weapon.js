const { bullet } = require('./bullets');

class weapon{
    constructor(player){
        this.pos = {x: (player.w/2)+player.pos.x, y: player.h+player.pos.y}
        this.prevXY = {y: null, x: null};
        this.rotation = 3.14159265;

        this.bullets = [];
    }

    weaponRotate(joystick){

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
}

module.exports = {
    weapon,
}