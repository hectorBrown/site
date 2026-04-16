// Vertex shader

struct VertexInput {
    @location(0) pixel_pos: vec2<f32>,
    @location(1) tex_coords: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
}

struct BoidInput {
    @location(2) row0: vec3<f32>,
    @location(3) row1: vec3<f32>,
};


@group(0) @binding(0)
var<uniform> to_ndc: mat2x4f;

@vertex
fn vs_main(
    model: VertexInput,
    boid: BoidInput
) -> VertexOutput {
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;
    var boid_transformation = mat2x3f(
        boid.row0,
        boid.row1,
    );
    var pixel_pos = vec3<f32>(model.pixel_pos.xy, 1.0) * boid_transformation; 
    var out2 = vec4<f32>(pixel_pos.xy, 0.0, 1.0) * to_ndc;
    out.clip_position = vec4<f32>(out2.xy, 0.0, 1.0);
    return out;
}

// Fragment shader
@group(1) @binding(0)
var t_diffuse: texture_2d<f32>;
@group(1) @binding(1)
var s_diffuse: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(t_diffuse, s_diffuse, in.tex_coords);
}

