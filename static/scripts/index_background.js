LOCALITY_R = 100;
SIG_SCALING = 10;
SEP_SCALE = 100;
ALI_SCALE = 100;
COH_SCALE = 5;
RAN_SCALE = 8;
MOUSE_SCALE = 1000;
PPB = 8645;
SPEED = 4;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function sigmoid(x) {
  return 1 / (1 + Math.E ** -(x - SIG_SCALING));
}
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  n_boids = Math.floor((width * height) / PPB);

  canvas.parent("background");
  canvas.style("z-index", "-1");
  frameRate(30);

  boid_sprite = loadImage("assets/boid.png");

  boids = [];
  //create and position boids
  for (let i = 0; i < n_boids; i++) {
    boid = {
      pos: createVector(random(0, width), random(0, height)),
      dir: (2 * PI * random(0, 360)) / 360,
    };
    boids.push(boid);
  }
}

function draw() {
  background(40, 40, 40);

  //setup zones
  zones = [];
  for (let i = 0; i <= Math.floor(width / LOCALITY_R); i++) {
    zones.push([]);
    for (let j = 0; j <= Math.floor(height / LOCALITY_R); j++) {
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

  //loop over all zones
  for (let i = 0; i < zones.length; i++) {
    for (let j = 0; j < zones[i].length; j++) {
      zone = zones[i][j];
      //loop over boids in zone
      for (let k = 0; k < zone.length; k++) {
        boid = zone[k];

        push();
        translate(boid.pos.x, boid.pos.y);
        imageMode(CENTER);
        rotate(boid.dir);
        image(boid_sprite, 0, 0, boid_sprite.width / 4, boid_sprite.height / 4);
        pop();

        //do calc here
        if (
          boid.pos.x > 0 &&
          boid.pos.x < width &&
          boid.pos.y > 0 &&
          boid.pos.y < height
        ) {
          //setup steer vectors
          dist_tot = createVector(0, 0);
          dir_tot = createVector(0, 0);
          pos_tot = createVector(0, 0);
          locality_count = 0;

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

              //loop over boids in neighbouring zone
              for (k_i = 0; k_i < zone_i.length; k_i++) {
                boid_i = zone_i[k_i];
                if (boid_i != boid) {
                  // if in locality
                  dist = p5.Vector.sub(boid_i.pos, boid.pos);
                  dist_mag = dist.mag();
                  if (dist_mag < LOCALITY_R) {
                    // add inverse mag dist to total
                    stroke(251, 241, 199, (1 - dist_mag / LOCALITY_R) * 255);
                    line(boid.pos.x, boid.pos.y, boid_i.pos.x, boid_i.pos.y);
                    dist = dist.setMag(dist.mag() ** -1);
                    dist_tot.add(dist);

                    dir_tot.add(
                      createVector(sin(boid_i.dir), -cos(boid_i.dir))
                    );

                    pos_tot.add(boid_i.pos);

                    locality_count += 1;
                  }
                }
              }
            }
          }
          // reverse dist_tot dir and scale
          dist_tot.setMag(-dist_tot.mag() * SEP_SCALE * locality_count ** 2);
          dir_tot.setMag((dir_tot.mag() * ALI_SCALE) / locality_count);

          mouse_tot = p5.Vector.sub(boid.pos, createVector(mouseX, mouseY));
          mouse_tot.setMag(-MOUSE_SCALE * mouse_tot.mag() ** -1);

          pos_tot.x /= locality_count;
          pos_tot.y /= locality_count;

          pos_tot = p5.Vector.sub(pos_tot, boid.pos);
          pos_tot.setMag(pos_tot.mag() * COH_SCALE);
          total = p5.Vector.add(dist_tot, dir_tot);
          total.add(pos_tot);
          //total.add(mouse_tot);
        } else {
          total = p5.Vector.sub(boid.pos, createVector(width / 2, height / 2));
          total.setMag(total.mag() * -10000);
        }
        ////stroke(255, 0, 0);
        ////line(
        ////  boid.pos.x,
        ////  boid.pos.y,
        ////  boid.pos.x + total.x,
        ////  boid.pos.y + total.y
        ////);

        perpVect = createVector(cos(boid.dir), sin(boid.dir));
        if (p5.Vector.dot(perpVect, total) > 0) {
          boid.dir +=
            (8 / 360) *
            2 *
            PI *
            sigmoid(Math.abs(p5.Vector.dot(perpVect, total) / SIG_SCALING));
        } else if (p5.Vector.dot(perpVect, total) < 0) {
          boid.dir -=
            (8 / 360) *
            2 *
            PI *
            sigmoid(Math.abs(p5.Vector.dot(perpVect, total) / SIG_SCALING));
        }
        boid.dir += (random(-RAN_SCALE, RAN_SCALE) / 360) * 2 * PI;
        boid.pos.x += SPEED * sin(boid.dir);
        boid.pos.y += -SPEED * cos(boid.dir);
      }
    }
  }
}
