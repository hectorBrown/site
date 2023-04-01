let eg1 = new p5((sketch) => {
  var RAN_SCALE = 8;
  var SPEED = 4;

  var boid;
  var parent;

  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth / 3);
  };

  sketch.setup = () => {
    parent = document.getElementById("eg-1-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth / 3);

    canvas.parent("eg-1-parent");
    sketch.frameRate(30);

    boid_sprite = sketch.loadImage("/assets/boid.png");

    boid = {
      pos: sketch.createVector(
        sketch.random(0, sketch.width),
        sketch.random(0, sketch.height)
      ),
      dir: (2 * sketch.PI * sketch.random(0, 360)) / 360,
    };
  };

  sketch.draw = () => {
    //setup colours
    sketch.background(52, 50, 48);
    sketch.push();
    sketch.translate(boid.pos.x, boid.pos.y);
    sketch.imageMode(sketch.CENTER);
    sketch.rotate(boid.dir);
    sketch.image(
      boid_sprite,
      0,
      0,
      boid_sprite.width / 4,
      boid_sprite.height / 4
    );
    sketch.pop();

    var total;

    if (
      boid.pos.x > 0 &&
      boid.pos.x < sketch.width &&
      boid.pos.y > 0 &&
      boid.pos.y < sketch.height
    ) {
      total = sketch.createVector(0, 0);
    } else {
      total = p5.Vector.sub(
        boid.pos,
        sketch.createVector(sketch.width / 2, sketch.height / 2)
      );
      total.setMag(total.mag() * -10000);
    }

    var perpVect = sketch.createVector(
      sketch.cos(boid.dir),
      sketch.sin(boid.dir)
    );
    if (p5.Vector.dot(perpVect, total) > 0) {
      boid.dir += (8 / 360) * 2 * sketch.PI;
    } else if (p5.Vector.dot(perpVect, total) < 0) {
      boid.dir -= (8 / 360) * 2 * sketch.PI;
    }

    boid.dir += (sketch.random(-RAN_SCALE, RAN_SCALE) / 360) * 2 * sketch.PI;
    boid.pos.x += SPEED * sketch.sin(boid.dir);
    boid.pos.y += -SPEED * sketch.cos(boid.dir);
  };
});
