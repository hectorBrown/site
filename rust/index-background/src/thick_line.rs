use cgmath::InnerSpace;

use crate::vertex::Vertex;

const THICKNESS: f32 = 2.0;
pub const VERTICES: &[Vertex] = &[
    Vertex {
        position: [0.0, THICKNESS / 2.0],
        tex_coords: [0.0, 0.0],
    }, // A
    Vertex {
        position: [0.0, -THICKNESS / 2.0],
        tex_coords: [1.0, 0.0],
    }, // B
    Vertex {
        position: [1.0, THICKNESS / 2.0],
        tex_coords: [0.0, 1.0],
    }, // C
    Vertex {
        position: [1.0, -THICKNESS / 2.0],
        tex_coords: [1.0, 1.0],
    }, // D
];

pub const INDICES: &[u16] = &[0, 2, 3, 0, 3, 1];

#[repr(C)]
#[derive(Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct LineRaw {
    pub transformation: [[f32; 3]; 2],
    pub alpha: f32,
}

impl LineRaw {
    pub fn new(
        position1: cgmath::Vector2<f32>,
        position2: cgmath::Vector2<f32>,
        max_line_length: f32,
    ) -> Self {
        let sep = position2 - position1;
        let dir = sep.y.atan2(sep.x);
        let length = sep.magnitude();
        LineRaw {
            transformation: [
                [dir.cos() * length, -dir.sin(), position1.x],
                [dir.sin() * length, dir.cos(), position1.y],
            ],
            alpha: (max_line_length - length) / max_line_length,
        }
    }
    pub fn desc() -> wgpu::VertexBufferLayout<'static> {
        use std::mem;
        wgpu::VertexBufferLayout {
            array_stride: mem::size_of::<LineRaw>() as wgpu::BufferAddress,
            // We need to switch from using a step mode of Vertex to Instance
            // This means that our shaders will only change to use the next
            // instance when the shader starts processing a new instance
            step_mode: wgpu::VertexStepMode::Instance,
            attributes: &[
                // A mat4 takes up 4 vertex slots as it is technically 4 vec4s. We need to define a slot
                // for each vec4. We'll have to reassemble the mat4 in the shader.
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[f32; 3]>() as wgpu::BufferAddress,
                    shader_location: 2,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: mem::size_of::<[[f32; 3]; 2]>() as wgpu::BufferAddress,
                    shader_location: 3,
                    format: wgpu::VertexFormat::Float32,
                },
            ],
        }
    }
}
