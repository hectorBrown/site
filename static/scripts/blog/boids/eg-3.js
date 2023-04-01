let eg3 = new p5((sketch) => {
  var RAN_SCALE = 8;
  var SPEED = 4;
  var N_BOIDS = 10;
  var LOCALITY_R = 50;

  var SIG_SCALING = 10;
  var SEP_SCALE = 5000;
  var ALI_SCALE = 50;
  var COH_SCALE = 5;
  var RAN_SCALE = 0;

  var parent;
  var boids;

  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth / 3);
  };

  sketch.setup = () => {
    parent = document.getElementById("eg-3-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth / 3);

    canvas.parent("eg-3-parent");
    sketch.frameRate(30);

    boid_sprite = sketch.loadImage("/assets/boid.png");

    boids = [];

    for (let i = 0; i < N_BOIDS; i++) {
      boids.push({
        pos: sketch.createVector(
          sketch.random(0, sketch.width),
          sketch.random(0, sketch.height)
        ),
        dir: (2 * sketch.PI * sketch.random(0, 360)) / 360,
      });
    }
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);
    for (let i = 0; i < N_BOIDS; i++) {
      var boid = boids[i];
      //setup colours
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
        //setup steer vectors
        var dist_tot = sketch.createVector(0, 0);
        var dir_tot = sketch.createVector(0, 0);
        var pos_tot = sketch.createVector(0, 0);
        var locality_count = 0;

        //loop over boids in neighbouring zone
        for (k_i = 0; k_i < boids.length; k_i++) {
          boid_i = boids[k_i];
          if (boid_i != boid) {
            // if in locality
            dist = p5.Vector.sub(boid_i.pos, boid.pos);
            dist_mag = dist.mag();
            if (dist_mag < LOCALITY_R) {
              // add inverse mag dist to total
              sketch.stroke(251, 241, 199, (1 - dist_mag / LOCALITY_R) * 255);
              sketch.line(boid.pos.x, boid.pos.y, boid_i.pos.x, boid_i.pos.y);
              dist = dist.setMag(dist.mag() ** -1);
              dist_tot.add(dist);

              dir_tot.add(
                sketch.createVector(
                  sketch.sin(boid_i.dir),
                  -sketch.cos(boid_i.dir)
                )
              );

              pos_tot.add(boid_i.pos);

              locality_count += 1;
            }
          }
        }
        // reverse dist_tot dir and scale
        dist_tot.setMag(-dist_tot.mag() * SEP_SCALE);
        dir_tot.setMag((dir_tot.mag() * ALI_SCALE) / locality_count);

        pos_tot.x /= locality_count;
        pos_tot.y /= locality_count;

        pos_tot = p5.Vector.sub(pos_tot, boid.pos);
        pos_tot.setMag(pos_tot.mag() * COH_SCALE);
        total = p5.Vector.add(dist_tot, dir_tot);
        total.add(pos_tot);
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
    }
  };
});
