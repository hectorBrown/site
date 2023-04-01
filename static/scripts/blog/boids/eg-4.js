let eg4 = new p5((sketch) => {
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
    parent = document.getElementById("eg-4-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth / 3);

    canvas.parent("eg-4-parent");
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
        focus: i == 0,
      });
    }
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);
    zones = [];
    for (let i = 0; i <= Math.floor(sketch.width / LOCALITY_R); i++) {
      zones.push([]);
      for (let j = 0; j <= Math.floor(sketch.height / LOCALITY_R); j++) {
        zones[i].push([]);
      }
    }
    for (let i = 0; i < boids.length; i++) {
      boid = boids[i];
      zone_x = Math.max(
        0,
        Math.min(zones.length - 1, Math.floor(boid.pos.x / LOCALITY_R))
      );
      zone_y = Math.max(
        0,
        Math.min(zones[zone_x].length - 1, Math.floor(boid.pos.y / LOCALITY_R))
      );
      zones[zone_x][zone_y].push(boid);
    }

    for (let i = 0; i < zones.length; i++) {
      for (let j = 0; j < zones[i].length; j++) {
        zone = zones[i][j];
        //loop over boids in zone
        for (let k = 0; k < zone.length; k++) {
          boid = zone[k];

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

          //do calc here
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
            var check_count = 0;

            //loop over neighbouring zones
            for (
              let i_i = Math.max(0, i - 1);
              i_i <= i + 1 && i_i < zones.length;
              i_i++
            ) {
              for (
                let j_i = Math.max(0, j - 1);
                j_i <= j + 1 && j_i < zones[i_i].length;
                j_i++
              ) {
                zone_i = zones[i_i][j_i];

                if (boid.focus && !(i_i == i && j_i == j)) {
                  sketch.fill(0, 0, 0, 0);
                  sketch.stroke(251, 73, 52);
                  sketch.square(i_i * LOCALITY_R, j_i * LOCALITY_R, LOCALITY_R);
                }

                //loop over boids in neighbouring zone
                for (k_i = 0; k_i < zone_i.length; k_i++) {
                  boid_i = zone_i[k_i];
                  if (boid_i != boid) {
                    // if in locality
                    dist = p5.Vector.sub(boid_i.pos, boid.pos);
                    check_count += 1;
                    dist_mag = dist.mag();
                    if (dist_mag < LOCALITY_R) {
                      // add inverse mag dist to total
                      sketch.stroke(
                        251,
                        241,
                        199,
                        (1 - dist_mag / LOCALITY_R) * 255
                      );
                      sketch.line(
                        boid.pos.x,
                        boid.pos.y,
                        boid_i.pos.x,
                        boid_i.pos.y
                      );
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
              }
            }
            if (boid.focus) {
              sketch.fill(0, 0, 0, 0);
              sketch.stroke(251, 241, 199);
              sketch.square(i * LOCALITY_R, j * LOCALITY_R, LOCALITY_R);
              counter_content = check_count + " other";
              if (check_count != 1) {
                counter_content += "s";
              }
              document.getElementById("eg-4-check-counter").textContent =
                counter_content;
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
            //total.add(mouse_tot);
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

          boid.dir +=
            (sketch.random(-RAN_SCALE, RAN_SCALE) / 360) * 2 * sketch.PI;
          boid.pos.x += SPEED * sketch.sin(boid.dir);
          boid.pos.y += -SPEED * sketch.cos(boid.dir);
        }
      }
    }
  };
});
