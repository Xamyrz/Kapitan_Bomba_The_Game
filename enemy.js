const { enemyWeapon } = require('./enemyWeapon');

class Enemy{
    constructor(width, height, x, y, image){
        this.h = height;
        this.w = width;
        this.pos = {x: x, y: y};
        this.image = image;
        this.jumping = false;
        this.falling = true;
        this.health = 5;
        this.vel = {x: 0, y: 0};

        this.top = {x: x+5, y: y};
        this.bottom = {x: x+5, y: y+height};
        this.left = {x: x, y: y+5};
        this.right= {x: x+width, y: y+5};
        
        this.weapon = new enemyWeapon(this);
    }

    updatePosition(){
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.top.x = this.pos.x+5;
        this.top.y = this.pos.y;
        this.bottom.x = this.pos.x+5;
        this.bottom.y = this.pos.y+this.h-10;
        this.left.x = this.pos.x;
        this.left.y = this.pos.y+5;
        this.right.x = this.pos.x+this.w-10;
        this.right.y = this.pos.y+5;

        this.weapon.pos = {x: this.pos.x, y: this.pos.y+10};
    }
    updateOnCollideGround(platform){
        this.pos.y = platform.y-this.h;
        this.bottom.y = platform.y;
    }
    updateOnCollideCeiling(platform){
        this.pos.y = platform.y+platform.h;
        this.top.y = platform.y;
    }
    updateOnCollideLeft(platform){
        this.pos.x = platform.x+platform.w;
        this.left.x = platform.x+platform.w;
    }
    updateOnCollideRight(platform){
        this.pos.x = platform.x-this.w;
        this.right.x = platform.x;
    }

    intersects(entity, size){
        return !( entity.x           > (this.pos.x + this.w) || 
        (entity.x + size.w) <  this.pos.x           || 
         entity.y           > (this.pos.y + this.h) ||
        (entity.y + size.h) <  this.pos.y);
    }
}

module.exports = {
    Enemy,
}