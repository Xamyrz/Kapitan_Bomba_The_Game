const { box } = require('./platforms');

module.exports = {
    levelOne,
}
function levelOne(){
    var boxes = []
    boxes.push(new box(5,600,-5,0,"#367a3f"))
    boxes.push(new box(5,600,605,0,"#367a3f"))
    // boxes.push(new box(10,10, 50,50,"#367a3f"))
    boxes.push(new box(400,10,100,550,"#367a3f"))
    boxes.push(new box(75,10,0,450,"#367a3f"))
    boxes.push(new box(75,10,525,450,"#367a3f"))
    //boxes.push(new box(500,10,5,400,"#367a3f"))
    boxes.push(new box(600,10,0,590,"#367a3f"))
    return boxes
}