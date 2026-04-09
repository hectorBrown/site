// Vertex shader

struct VertexInput {
    @location(0) pixel_pos: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) alpha: f32,
}

struct InstanceInput {
  @location(1) position1: vec2<f32>,
  @location(2) position2: vec2<f32>,
}



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
    instance: InstanceInput,
) -> VertexOutput {
    var out: VertexOutput;
    //TODO: this whole transformation should be a matrix generated on CPU
    var separation = instance.position2 - instance.position1;
    var line_length = length(separation);

    var stretched = vec2<f32>(model.pixel_pos.x * line_length,
    model.pixel_pos.y);
    var rotated = rotate2d(stretched,
    atan2(separation.y, separation.x));
    var pixel_out = rotated + instance.position1;
    
    out.clip_position = vec4<f32>(pixel_out.xy, 0.0, 1.0) * to_ndc;
    out.alpha = (100.0 - line_length) / 100.0;
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(235.0 / 255.0, 219.0 / 255.0, 178.0 / 255.0, in.alpha);
}

