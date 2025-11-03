use macroquad::prelude::*;
use std::f32::consts::PI;
const LOCALITY_R: f32 = 100.0;
const SIG_SCALING: u8 = 10;
const SEP_SCALE: u8 = 32;
const ALI_SCALE: u8 = 64;
const COH_SCALE: u8 = 128;
const RAN_SCALE: u8 = 8;
const PPB: u16 = 8645;
const SPEED: f32 = 100.0;

fn sigmoid(x: f32) -> f32 {
    1.0 / (1.0 + (-x).exp())
}

#[derive(PartialEq)]
struct Boid {
    id: usize,
    pos: Vec2,
    dir: f32,
    zone: (usize, usize),
}

fn gen_boids(n: usize, size: (f32, f32)) -> Vec<Boid> {
    let mut boids: Vec<Boid> = Vec::new();
    for i in 0..n {
        let pos = Vec2::new(rand::gen_range(0.0, size.0), rand::gen_range(0.0, size.1));
        let (zone_x, zone_y) = get_zone_index(pos, size);

        boids.push(Boid {
            id: i,
            pos,
            dir: rand::gen_range(0 as f32, 2.0 * PI),
            zone: (zone_x, zone_y),
        });
    }
    boids
}

fn get_zone_index(pos: Vec2, size: (f32, f32)) -> (usize, usize) {
    let zone_n_x = (size.0 / LOCALITY_R) as usize + 1;
    let zone_n_y = (size.1 / LOCALITY_R) as usize + 1;
    let zone_x = 0.max((zone_n_x - 1).min((pos.x / LOCALITY_R) as usize));
    let zone_y = 0.max((zone_n_y - 1).min((pos.y / LOCALITY_R) as usize));
    (zone_x, zone_y)
}

fn refresh_zones(boids: &[Boid], size: (f32, f32)) -> Vec<Vec<Vec<&Boid>>> {
    let mut zones = vec![
        vec![Vec::new(); (size.1 / LOCALITY_R) as usize + 1];
        (size.0 / LOCALITY_R) as usize + 1
    ];
    for boid in boids.iter() {
        let (zone_x, zone_y) = get_zone_index(boid.pos, size);
        zones[zone_x][zone_y].push(boid);
    }

    zones
}

fn update_boid_zones(boids: &mut [Boid], size: (f32, f32)) {
    for boid in boids.iter_mut() {
        let (zone_x, zone_y) = get_zone_index(boid.pos, size);
        boid.zone = (zone_x, zone_y);
    }
}

fn get_boids_in_locality<'a>(
    zones: &[Vec<Vec<&'a Boid>>],
    zone_pos: (usize, usize),
) -> Vec<&'a Boid> {
    let mut locality_boids: Vec<&Boid> = Vec::new();

    for zone_x in zones
        [(0.max(zone_pos.0 as isize - 1)) as usize..(zone_pos.0 + 1).min(zones.len() - 1)]
        .iter()
    {
        for zone in zone_x
            [(0.max(zone_pos.1 as isize - 1)) as usize..(zone_pos.1 + 1).min(zone_x.len() - 1)]
            .iter()
        {
            locality_boids.extend(zone.iter());
        }
    }

    locality_boids
}

fn get_influences(boid: &Boid, in_locality: &[&Boid]) -> (Vec2, Vec2, Vec2) {
    let mut dist_tot = Vec2::new(0.0, 0.0);
    let mut dir_tot = Vec2::new(0.0, 0.0);
    let mut pos_tot = Vec2::new(0.0, 0.0);
    let mut locality_count: usize = 0;
    for other_boid in in_locality.iter() {
        if other_boid != &boid {
            let mut dist = other_boid.pos - boid.pos;
            if dist.length() < LOCALITY_R as f32 {
                if other_boid.pos.x <= boid.pos.x {
                    draw_line(
                        boid.pos.x,
                        boid.pos.y,
                        other_boid.pos.x,
                        other_boid.pos.y,
                        2.0,
                        Color::new(0.984, 0.945, 0.780, 1.0 - dist.length() / LOCALITY_R as f32),
                    )
                }
                dist = -dist.normalize() * dist.length().powf(-1.0);
                dist_tot += dist;

                dir_tot += Vec2::new((other_boid.dir).cos(), -(other_boid.dir).sin());

                pos_tot += other_boid.pos;

                locality_count += 1;
            }
        }
    }
    dist_tot *= SEP_SCALE as f32 * locality_count.pow(2) as f32;
    dir_tot *= ALI_SCALE as f32 / locality_count as f32;
    pos_tot /= locality_count as f32;
    pos_tot -= boid.pos;
    pos_tot = pos_tot.normalize();
    pos_tot *= COH_SCALE as f32;

    (dist_tot, dir_tot, pos_tot)
}

#[macroquad::main("index-background")]
async fn main() {
    let background_color = Color::new(0.1569, 0.1569, 0.1569, 1.0);
    let mut width = screen_width();
    let mut height = screen_height();
    let n_boids = ((width * height) / PPB as f32).floor() as usize;
    let boid_sprite = Texture2D::from_file_with_format(
        include_bytes!("../../../static/assets/boid.png"),
        Some(ImageFormat::Png),
    );
    let boid_size = Vec2::new(boid_sprite.width() / 4.0, boid_sprite.height() / 4.0);

    //setup boids
    let mut boids = gen_boids(n_boids, (width, height));

    let mut last_frame_time = get_time();

    loop {
        clear_background(background_color);
        width = screen_width();
        height = screen_height();
        //setup zones

        update_boid_zones(&mut boids, (width, height));
        let zones = refresh_zones(&boids, (width, height));

        let mut totals = Vec::new();
        for boid in boids.iter() {
            if boid.pos.x > 0.0 && boid.pos.y > 0.0 && boid.pos.x < width && boid.pos.y < height {
                let locality_boids = get_boids_in_locality(&zones, boid.zone);
                let (dist_tot, dir_tot, pos_tot) = get_influences(boid, &locality_boids);

                totals.push(dist_tot + dir_tot + pos_tot);
            } else {
                totals.push(-10000.0 * (boid.pos - Vec2::new(width / 2.0, height / 2.0)));
            }
            // draw boid
            draw_texture_ex(
                &boid_sprite,
                boid.pos.x - boid_size.x / 2.0, // x position
                boid.pos.y - boid_size.y / 2.0, // y position
                WHITE,                          // tint color
                DrawTextureParams {
                    dest_size: Some(boid_size),
                    rotation: boid.dir, // Optional: rotate the texture
                    source: None,       // Optional: specify a source rectangle for sprite sheets
                    flip_x: false,      // Optional: flip horizontally
                    flip_y: false,      // Optional: flip vertically
                    pivot: None,        // Optional: rotation pivot
                },
            );
        }

        let end_time = get_time();
        for (total, boid) in totals.iter().zip(boids.iter_mut()) {
            let perp_vect = Vec2::new(boid.dir.cos(), boid.dir.sin());

            if perp_vect.dot(*total) > 0.0 {
                boid.dir += (8.0 / 360.0)
                    * 2.0
                    * std::f32::consts::PI
                    * sigmoid((perp_vect.dot(*total) / SIG_SCALING as f32).abs());
            } else if perp_vect.dot(*total) < 0.0 {
                boid.dir -= (8.0 / 360.0)
                    * 2.0
                    * std::f32::consts::PI
                    * sigmoid((perp_vect.dot(*total) / SIG_SCALING as f32).abs());
            }

            boid.dir += rand::gen_range(-(RAN_SCALE as f32), RAN_SCALE as f32) / 360.0
                * 2.0
                * std::f32::consts::PI;
            let deltatime = end_time - last_frame_time;
            if deltatime < 0.1 {
                boid.pos.x += SPEED * boid.dir.sin() * (end_time - last_frame_time) as f32;
                boid.pos.y += -SPEED * boid.dir.cos() * (end_time - last_frame_time) as f32;
            }
        }
        last_frame_time = end_time;

        next_frame().await;
    }
}
