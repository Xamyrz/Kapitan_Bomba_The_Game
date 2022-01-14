module.exports = {
    box,
}

function box(width, height, x, y, color){
    this.h = height;
    this.w = width;
    this.x = x;
    this.y = y;
    this.color = color
    // this.top = {pos1: x, pos2: x*width, posY: y}
    // this.bottom = {pos1: x, pos2: x*width, posY: y+height}
}

box.prototype.intersects = function(entity, size) {
    return !( entity.x           > (this.x + this.w) || 
             (entity.x + size.w) <  this.x           || 
              entity.y           > (this.y + this.h) ||
             (entity.y + size.h) <  this.y);
}