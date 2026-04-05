use crate::rng;
use crate::thick_line::LineRaw;
use cgmath::{InnerSpace, Vector2};
use rand::rngs::SmallRng;
use wasm_bindgen::prelude::*;

const LOCALITY_R: f32 = 100.0;
const SIG_SCALING: u8 = 10;
const SEP_SCALE: u8 = 64;
const ALI_SCALE: u8 = 128;
const COH_SCALE: u8 = 255;
const RAN_SCALE: u8 = 8;
// const PPB: u16 = 8645;
const PPB: u16 = 4000;
const SPEED: f32 = 1.0;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Date)]
    fn now() -> f32;
}

fn sigmoid(x: f32) -> f32 {
    1.0 / (1.0 + (-x).exp())
}

#[derive(PartialEq)]
pub struct Boid {
    pub id: usize,
    pub pos: Vector2<f32>,
    pub dir: f32,
    pub zone: (usize, usize),
}

impl Boid {
    pub fn to_raw(&self) -> BoidRaw {
        BoidRaw {
            position: [self.pos.x, self.pos.y],
            rotation: self.dir,
        }
    }
}

#[repr(C)]
#[derive(Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct BoidRaw {
    position: [f32; 2],
    rotation: f32,
}

impl BoidRaw {
    pub fn desc() -> wgpu::VertexBufferLayout<'static> {
        use std::mem;
        wgpu::VertexBufferLayout {
            array_stride: mem::size_of::<BoidRaw>() as wgpu::BufferAddress,
            // We need to switch from using a step mode of Vertex to Instance
            // This means that our shaders will only change to use the next
            // instance when the shader starts processing a new instance
            step_mode: wgpu::VertexStepMode::Instance,
            attributes: &[
                // A mat4 takes up 4 vertex slots as it is technically 4 vec4s. We need to define a slot
                // for each vec4. We'll have to reassemble the mat4 in the shader.
                wgpu::VertexAttribute {
                    offset: 0,
                    // While our vertex shader only uses locations 0, and 1 now, in later tutorials, we'll
                    // be using 2, 3, and 4, for Vertex. We'll start at slot 5, not conflict with them later
                    shader_location: 2,
                    format: wgpu::VertexFormat::Float32x2,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 2]>() as wgpu::BufferAddress,
                    shader_location: 3,
                    format: wgpu::VertexFormat::Float32,
                },
            ],
        }
    }
}

pub fn gen_boids(size: (f32, f32), rng: &mut SmallRng) -> Vec<Boid> {
    let mut boids: Vec<Boid> = Vec::new();
    for i in 0..(size.0 * size.1 / PPB as f32) as usize {
        let pos = Vector2::new(
            rng::gen_range(0.0, size.0, rng),
            rng::gen_range(0.0, size.1, rng),
        );
        let (zone_x, zone_y) = get_zone_index(pos, size);

        boids.push(Boid {
            id: i,
            pos,
            dir: rng::gen_range(0 as f32, 2.0 * std::f32::consts::PI, rng),
            zone: (zone_x, zone_y),
        });
    }
    boids
}
fn get_zone_index(pos: Vector2<f32>, size: (f32, f32)) -> (usize, usize) {
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

    for zone_x in
        zones[(0.max(zone_pos.0 as isize - 1)) as usize..(zone_pos.0 + 2).min(zones.len())].iter()
    {
        for zone in zone_x
            [(0.max(zone_pos.1 as isize - 1)) as usize..(zone_pos.1 + 2).min(zone_x.len())]
            .iter()
        {
            locality_boids.extend(zone.iter());
        }
    }

    locality_boids
}

fn get_influences(
    boid: &Boid,
    in_locality: &[&Boid],
    sep_scale: f32,
    ali_scale: f32,
    coh_scale: f32,
) -> (Vector2<f32>, Vector2<f32>, Vector2<f32>) {
    let mut dist_tot = Vector2::new(0.0, 0.0);
    let mut dir_tot = Vector2::new(0.0, 0.0);
    let mut pos_tot = Vector2::new(0.0, 0.0);
    let mut locality_count: usize = 0;
    for other_boid in in_locality.iter() {
        if other_boid != &boid {
            let mut dist = other_boid.pos - boid.pos;
            if dist.magnitude() < LOCALITY_R {
                dist = -dist.normalize() * dist.magnitude().powf(-1.0);
                dist_tot += dist;

                dir_tot += Vector2::new((other_boid.dir).cos(), -(other_boid.dir).sin());

                pos_tot += other_boid.pos;

                locality_count += 1;
            }
        }
    }

    dist_tot *= sep_scale * SEP_SCALE as f32 * locality_count.pow(2) as f32;
    dir_tot *= ali_scale * ALI_SCALE as f32 / locality_count as f32;
    pos_tot /= locality_count as f32;
    pos_tot -= boid.pos;
    pos_tot = pos_tot.normalize();
    pos_tot *= coh_scale * COH_SCALE as f32;

    (dist_tot, dir_tot, pos_tot)
}

pub fn update_boids(
    boids: &mut [Boid],
    width: f32,
    height: f32,
    last_frame_time: f32,
    sep_scale: f32,
    ali_scale: f32,
    coh_scale: f32,
    rng: &mut SmallRng,
) -> (f32, Vec<LineRaw>) {
    let mut network_lines: Vec<LineRaw> = Vec::new();
    update_boid_zones(boids, (width, height));
    let zones = refresh_zones(boids, (width, height));

    let mut totals = Vec::new();
    for boid in boids.iter() {
        if boid.pos.x > 0.0 && boid.pos.y > 0.0 && boid.pos.x < width && boid.pos.y < height {
            let locality_boids = get_boids_in_locality(&zones, boid.zone);
            network_lines.extend(locality_boids.iter().filter_map(|l| {
                if l.id > boid.id {
                    Some(LineRaw {
                        position1: [boid.pos.x, boid.pos.y],
                        position2: [l.pos.x, l.pos.y],
                    })
                } else {
                    None
                }
            }));

            let (dist_tot, dir_tot, pos_tot) =
                get_influences(boid, &locality_boids, sep_scale, ali_scale, coh_scale);

            totals.push(dist_tot + dir_tot + pos_tot);
        } else {
            totals.push((boid.pos - Vector2::new(width / 2.0, height / 2.0)) * -10000.0);
        }
        // draw boid
        // RETURN BOIDS
    }

    let end_time = now();
    for (total, boid) in totals.iter().zip(boids.iter_mut()) {
        let perp_vect = Vector2::new(boid.dir.cos(), boid.dir.sin());

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

        boid.dir += ((rand::Rng::next_u32(rng) as f32 / u32::MAX as f32 * RAN_SCALE as f32 * 2.0)
            - RAN_SCALE as f32)
            / 360.0
            * 2.0
            * std::f32::consts::PI;
        let deltatime = end_time - last_frame_time;
        if deltatime < 0.1 {
            boid.pos.x += SPEED * boid.dir.sin() * (end_time - last_frame_time) as f32;
            boid.pos.y += -SPEED * boid.dir.cos() * (end_time - last_frame_time) as f32;
        }
        boid.pos.x += SPEED * boid.dir.sin();
        boid.pos.y += -SPEED * boid.dir.cos();
    }
    (last_frame_time, network_lines)
}
