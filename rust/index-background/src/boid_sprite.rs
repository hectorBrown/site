use crate::vertex::Vertex;

const BOID_SIZE: f32 = 0.25;
pub const VERTICES: &[Vertex] = &[
    Vertex {
        position: [-21.0 * BOID_SIZE, -30.5 * BOID_SIZE, 0.0],
        tex_coords: [0.0, 0.0],
    }, // A
    Vertex {
        position: [21.0 * BOID_SIZE, -30.5 * BOID_SIZE, 0.0],
        tex_coords: [1.0, 0.0],
    }, // B
    Vertex {
        position: [-21.0 * BOID_SIZE, 30.5 * BOID_SIZE, 0.0],
        tex_coords: [0.0, 1.0],
    }, // C
    Vertex {
        position: [21.0 * BOID_SIZE, 30.5 * BOID_SIZE, 0.0],
        tex_coords: [1.0, 1.0],
    }, // D
];

pub const INDICES: &[u16] = &[0, 1, 2, 1, 3, 2];
