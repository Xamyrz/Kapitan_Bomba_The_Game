const { box } = require('./platforms');

module.exports = {
    levelOne,
}
function levelOne(){
    var boxes = []
    // boxes.push(new box(10,10, 50,50,"#367a3f"))
    boxes.push(new box(200,10,150,450,"#367a3f"))
    boxes.push(new box(500,10,5,400,"#367a3f"))
    boxes.push(new box(600,10,5,600,"#367a3f"))
    return boxes
}