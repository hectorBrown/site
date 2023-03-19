LOCALITY_R = 100;
SIG_SCALING = 10;
SEP_SCALE = 100;
ALI_SCALE = 70;
COH_SCALE = 5;
RAN_SCALE = 8;
MOUSE_SCALE = 1000;
N_BOIDS = 100;
SPEED = 4;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function sigmoid(x) {
  return 1 / (1 + Math.E ** -(x - SIG_SCALING));
}
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("background");
  canvas.style("z-index", "-1");
  frameRate(30);

  boid_sprite = loadImage("assets/boid.png");
  boids = [];
  for (let i = 0; i < N_BOIDS; i++) {
    boids.push({
      pos: createVector(random(0, width), random(0, height)),
      dir: (2 * PI * random(0, 360)) / 360,
    });
  }
}

function draw() {
  console.log(width.toString() + ", " + height.toString());
  background(40, 40, 40);
  //loop over all boids and draw
  for (let i = 0; i < N_BOIDS; i++) {
    push();
    translate(boids[i].pos.x, boids[i].pos.y);
    imageMode(CENTER);
    rotate(boids[i].dir);
    image(boid_sprite, 0, 0, boid_sprite.width / 4, boid_sprite.height / 4);
    pop();

    //do calc here
    if (
      boids[i].pos.x > 0 &&
      boids[i].pos.x < width &&
      boids[i].pos.y > 0 &&
      boids[i].pos.y < height
    ) {
      dist_tot = createVector(0, 0);
      dir_tot = createVector(0, 0);
      pos_tot = createVector(0, 0);
      locality_count = 0;
      for (let j = 0; j < N_BOIDS; j++) {
        // if in locality
	dist = p5.Vector.sub(boids[j].pos, boids[i].pos);
	dist_mag = dist.mag()
        if (dist_mag < LOCALITY_R) {
          // add inverse mag dist to total
	  stroke(251, 241, 199, (1 - dist_mag / LOCALITY_R) * 255);
          line(boids[i].pos.x, boids[i].pos.y, boids[j].pos.x, boids[j].pos.y);
          dist = dist.setMag(dist.mag() ** -10);
          dist_tot.add(dist);

          dir_tot.add(createVector(sin(boids[j].dir), -cos(boids[j].dir)));

          pos_tot.add(boids[j].pos);

          locality_count += 1;
        }
      }
      // reverse dist_tot dir and scale
      dist_tot.setMag(-dist_tot.mag() * SEP_SCALE * locality_count ** 2);
      dir_tot.setMag((dir_tot.mag() * ALI_SCALE) / locality_count);

      mouse_tot = p5.Vector.sub(boids[i].pos, createVector(mouseX, mouseY));
      mouse_tot.setMag(-MOUSE_SCALE * mouse_tot.mag() ** -1);

      pos_tot.x /= locality_count;
      pos_tot.y /= locality_count;

      pos_tot = p5.Vector.sub(pos_tot, boids[i].pos);
      pos_tot.setMag(pos_tot.mag() * COH_SCALE);
      total = p5.Vector.add(dist_tot, dir_tot);
      total.add(pos_tot);
      //total.add(mouse_tot);
    } else {
      total = p5.Vector.sub(boids[i].pos, createVector(width / 2, height / 2));
      total.setMag(total.mag() * -10000);
    }
    //stroke(255, 0, 0);
    //line(
    //  boids[i].pos.x,
    //  boids[i].pos.y,
    //  boids[i].pos.x + total.x,
    //  boids[i].pos.y + total.y
    //);

    perpVect = createVector(cos(boids[i].dir), sin(boids[i].dir));
    if (p5.Vector.dot(perpVect, total) > 0) {
      boids[i].dir +=
        (8 / 360) *
        2 *
        PI *
        sigmoid(p5.Vector.dot(perpVect, total) / SIG_SCALING);
    } else if (p5.Vector.dot(perpVect, total) < 0) {
      boids[i].dir -=
        (8 / 360) * 2 * PI * sigmoid(p5.Vector.dot(perpVect, total));
    }
    boids[i].dir += (random(-RAN_SCALE, RAN_SCALE) / 360) * 2 * PI;
    boids[i].pos.x += SPEED * sin(boids[i].dir);
    boids[i].pos.y += -SPEED * cos(boids[i].dir);
  }
}
