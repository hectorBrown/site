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
    @location(2) position: vec2<f32>,
    @location(3) rotation: f32,
};


@group(0) @binding(0)
var<uniform> to_ndc: mat4x4f;

fn rotate2d(v: vec2<f32>, angle: f32) -> vec2<f32> {
    let c = cos(angle);
    let s = sin(angle);
    return vec2<f32>(
        c * v.x - s * v.y,
        s * v.x + c * v.y
    );
}

@vertex
fn vs_main(
    model: VertexInput,
    boid: BoidInput
) -> VertexOutput {
    //TODO: rotate2d should be matrices generated on CPU
    var out: VertexOutput;
    out.tex_coords = model.tex_coords;
    var pixel_out =  vec4<f32>(rotate2d(model.pixel_pos, boid.rotation) + boid.position, 0.0, 1.0); // 2.
    
    out.clip_position = pixel_out * to_ndc;
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

