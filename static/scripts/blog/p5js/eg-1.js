let eg1 = new p5((sketch) => {
  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth);
    shape.pos = sketch.createVector(0, 0);
  };

  sketch.setup = () => {
    parent = document.getElementById("eg-1-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth);

    canvas.parent("eg-1-parent");
    sketch.frameRate(30);

    shape = {
      pos: sketch.createVector(0, 0),
      dir: sketch.createVector(5, 4),
      size: sketch.width / 10,
    };
  };

  sketch.draw = () => {
    //setup colours
    sketch.background(102, 92, 84);
    sketch.stroke(169, 172, 38);
    sketch.fill(169, 172, 38);

    //draw square
    sketch.square(shape.pos.x, shape.pos.y, shape.size);

    //move square
    shape.pos.add(shape.dir);

    //bounce off of walls
    if (shape.pos.x < 0 || shape.pos.x + shape.size > sketch.width) {
      shape.dir.x *= -1;
    }
    if (shape.pos.y < 0 || shape.pos.y + shape.size > sketch.height) {
      shape.dir.y *= -1;
    }
  };
});
