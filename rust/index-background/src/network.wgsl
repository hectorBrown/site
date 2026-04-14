// Vertex shader

struct VertexInput {
    @location(0) pixel_pos: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) alpha: f32,
}

struct InstanceInput {
  @location(1) row0: vec4<f32>,
  @location(2) row1: vec4<f32>,
  @location(3) row2: vec4<f32>,
  @location(4) row3: vec4<f32>,
  @location(5) alpha: f32,
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
    var instance_matrix = mat4x4f(
        instance.row0,
        instance.row1,
        instance.row2,
        instance.row3
    );
    
    out.clip_position = vec4<f32>(model.pixel_pos.xy, 0.0, 1.0) * instance_matrix * to_ndc;
    out.alpha = instance.alpha;
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(235.0 / 255.0, 219.0 / 255.0, 178.0 / 255.0, in.alpha);
}

