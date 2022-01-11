module.exports = {
    box,
}

function box(width, height, x, y, color){
    this.h = height;
    this.w = width;
    this.x = x;
    this.y = y;
    this.color =  color
}

box.prototype.intersects = function(player) {
    return !( player.pos.x           > (this.x + this.w) || 
             (player.pos.x + 50) <  this.x           || 
              player.pos.y           > (this.y + this.h) ||
             (player.pos.y + 100) <  this.y);
}