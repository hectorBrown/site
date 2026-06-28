function windowResized() {
  resizeCanvas(parent.clientWidth, parent.clientWidth);
  shape.pos = createVector(0, 0);
}

function setup() {
  parent = document.getElementById("eg-1-parent");
  canvas = createCanvas(parent.clientWidth, parent.clientWidth);

  canvas.parent("eg-1-parent");
  frameRate(30);

  shape = {
    pos: createVector(0, 0),
    dir: createVector(5, 4),
    size: width / 10,
  };
}

function draw() {
  //setup colours
  background(102, 92, 84);
  stroke(169, 172, 38);
  fill(169, 172, 38);

  //draw square
  square(shape.pos.x, shape.pos.y, shape.size);

  //move square
  shape.pos.add(shape.dir);

  //bounce off of walls
  if (shape.pos.x < 0 || shape.pos.x + shape.size > width) {
    shape.dir.x *= -1;
  }
  if (shape.pos.y < 0 || shape.pos.y + shape.size > height) {
    shape.dir.y *= -1;
  }
}
