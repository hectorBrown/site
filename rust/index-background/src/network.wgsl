// Vertex shader

struct VertexInput {
    @location(0) pixel_pos: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) alpha: f32,
}

struct InstanceInput {
  @location(1) row0: vec3<f32>,
  @location(2) row1: vec3<f32>,
  @location(3) alpha: f32,
}



@group(0) @binding(0)
var<uniform> to_ndc: mat2x4f;


@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    var out: VertexOutput;
    var instance_matrix = mat2x3f(
        instance.row0,
        instance.row1,
    );
    
    var pixel_pos = vec3<f32>(model.pixel_pos.xy, 1.0) * instance_matrix;
    var out2 = vec4<f32>(pixel_pos.xy,0.0, 1.0) * to_ndc;
    out.clip_position = vec4<f32>(out2.xy, 0.0, 1.0);
    out.alpha = instance.alpha;
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(235.0 / 255.0, 219.0 / 255.0, 178.0 / 255.0, in.alpha);
}

