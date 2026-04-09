mod app;
mod boid_sprite;
mod boids;
mod rng;
mod texture;
mod thick_line;
mod vertex;

use crate::app::App;
use crate::boids::{Boid, BoidRaw};
use crate::thick_line::LineRaw;
use crate::vertex::{SimpleVertex, Vertex};

use std::sync::Arc;
use wasm_bindgen::prelude::*;
use web_sys::HtmlInputElement;
use wgpu::util::DeviceExt;
use winit::{event_loop::EventLoop, window::Window};

// This will store the state of our game
pub struct State {
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    is_surface_configured: bool,
    window: Arc<Window>,
    sprite_render_pipeline: wgpu::RenderPipeline,
    network_render_pipeline: wgpu::RenderPipeline,
    sprite_vertex_buffer: wgpu::Buffer,
    sprite_index_buffer: wgpu::Buffer,
    line_vertex_buffer: wgpu::Buffer,
    line_index_buffer: wgpu::Buffer,
    network_lines: Vec<LineRaw>,
    network_buffer: wgpu::Buffer,
    sprite_bind_group: wgpu::BindGroup,
    screen_size_buffer: wgpu::Buffer,
    screen_size_bind_group: wgpu::BindGroup,
    boids: Vec<Boid>,
    boid_buffer: wgpu::Buffer,
    last_frame_time: f32,
    sep_slider: HtmlInputElement,
    ali_slider: HtmlInputElement,
    coh_slider: HtmlInputElement,
}

impl State {
    pub async fn new(window: Arc<Window>) -> anyhow::Result<Self> {
        //
        // PREAMBLE
        //
        let size = window.inner_size();

        // The instance is a handle to our GPU
        // BackendBit::PRIMARY => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
            backends: wgpu::Backends::all(),
            ..Default::default()
        });

        let surface = instance.create_surface(window.clone()).unwrap();

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::LowPower,
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await?;

        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: None,
                required_features: wgpu::Features::empty(),
                experimental_features: wgpu::ExperimentalFeatures::disabled(),
                // WebGL doesn't support all of wgpu's features, so if
                // we're building for the web we'll have to disable some.
                required_limits: wgpu::Limits::downlevel_webgl2_defaults(),
                memory_hints: Default::default(),
                trace: wgpu::Trace::Off,
            })
            .await?;

        let surface_caps = surface.get_capabilities(&adapter);
        let surface_format = surface_caps
            .formats
            .iter()
            .find(|f| f.is_srgb())
            .copied()
            .unwrap_or(surface_caps.formats[0]);
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: wgpu::PresentMode::Fifo,
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };

        //
        // SETUP BOID INSTANCE BUFFER
        //
        let mut rng = rng::get_rng();
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id("glcanvas").unwrap();
        let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into().unwrap();
        let boids = boids::gen_boids(
            (canvas.client_width() as f32, canvas.client_height() as f32),
            &mut rng,
        );

        let boid_data: Vec<BoidRaw> = boids.iter().map(Boid::to_raw).collect();
        let boid_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Boid Buffer"),
            contents: bytemuck::cast_slice(&boid_data),
            usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
        });

        // just take a pair of every boid to set an upper bound for the required buffer size
        let network_lines: Vec<LineRaw> = boids
            .iter()
            .flat_map(|b| {
                boids.iter().filter_map(|other_boid| {
                    if b.id < other_boid.id {
                        Some(LineRaw {
                            position1: [b.pos.x, b.pos.y],
                            position2: [other_boid.pos.x, other_boid.pos.y],
                        })
                    } else {
                        None
                    }
                })
            })
            .collect();
        let network_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Network Buffer"),
            contents: bytemuck::cast_slice(&network_lines),
            usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
        });

        //
        // SETUP BOID SPRITE TEXTURE BIND
        //
        let sprite_bytes = include_bytes!("../../../static/assets/boid.png");
        let sprite_texture =
            texture::Texture::from_bytes(&device, &queue, sprite_bytes, "boid.png")?;

        let texture_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[
                    wgpu::BindGroupLayoutEntry {
                        binding: 0,
                        visibility: wgpu::ShaderStages::FRAGMENT,
                        ty: wgpu::BindingType::Texture {
                            multisampled: false,
                            view_dimension: wgpu::TextureViewDimension::D2,
                            sample_type: wgpu::TextureSampleType::Float { filterable: true },
                        },
                        count: None,
                    },
                    wgpu::BindGroupLayoutEntry {
                        binding: 1,
                        visibility: wgpu::ShaderStages::FRAGMENT,
                        // This should match the filterable field of the
                        // corresponding Texture entry above.
                        ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                        count: None,
                    },
                ],
                label: Some("texture_bind_group_layout"),
            });

        let sprite_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &texture_bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::TextureView(&sprite_texture.view),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::Sampler(&sprite_texture.sampler),
                },
            ],
            label: Some("sprite_bind_group"),
        });

        //
        // SCREEN SIZE BUFFER
        //

        let screen_size_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Screen Size Buffer"),
            contents: bytemuck::cast_slice(&window_size_matrix(size.width, size.height)),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let screen_size_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            std::mem::size_of::<[[f32; 4]; 4]>() as _,
                        ),
                    },
                    count: None,
                }],
                label: Some("screen_size_bind_group_layout"),
            });

        let screen_size_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &screen_size_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: screen_size_buffer.as_entire_binding(),
            }],
            label: Some("screen_size_bind_group"),
        });

        let sprite_shader = device.create_shader_module(wgpu::include_wgsl!("sprite.wgsl"));
        let sprite_render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Sprite Render Pipeline Layout"),
                bind_group_layouts: &[&screen_size_bind_group_layout, &texture_bind_group_layout],
                push_constant_ranges: &[],
            });
        let sprite_render_pipeline =
            device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some("Sprite Render Pipeline"),
                layout: Some(&sprite_render_pipeline_layout),
                vertex: wgpu::VertexState {
                    module: &sprite_shader,
                    entry_point: Some("vs_main"),
                    buffers: &[Vertex::desc(), BoidRaw::desc()],
                    compilation_options: wgpu::PipelineCompilationOptions::default(),
                },
                fragment: Some(wgpu::FragmentState {
                    module: &sprite_shader,
                    entry_point: Some("fs_main"),
                    targets: &[Some(wgpu::ColorTargetState {
                        format: config.format,
                        blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                        write_mask: wgpu::ColorWrites::ALL,
                    })],
                    compilation_options: wgpu::PipelineCompilationOptions::default(),
                }),
                primitive: wgpu::PrimitiveState {
                    topology: wgpu::PrimitiveTopology::TriangleList,
                    strip_index_format: None,
                    front_face: wgpu::FrontFace::Ccw,
                    cull_mode: None,
                    unclipped_depth: false,
                    polygon_mode: wgpu::PolygonMode::Fill,
                    conservative: false,
                },
                depth_stencil: None,
                multisample: wgpu::MultisampleState {
                    count: 1,
                    mask: !0,
                    alpha_to_coverage_enabled: false,
                },
                multiview: None,
                cache: None,
            });

        let network_shader = device.create_shader_module(wgpu::include_wgsl!("network.wgsl"));

        let network_render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Network Render Pipeline Layout"),
                bind_group_layouts: &[&screen_size_bind_group_layout],
                push_constant_ranges: &[],
            });
        let network_render_pipeline =
            device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some("Network Render Pipeline"),
                layout: Some(&network_render_pipeline_layout),
                vertex: wgpu::VertexState {
                    module: &network_shader,
                    entry_point: Some("vs_main"),
                    buffers: &[SimpleVertex::desc(), LineRaw::desc()],
                    compilation_options: wgpu::PipelineCompilationOptions::default(),
                },
                fragment: Some(wgpu::FragmentState {
                    module: &network_shader,
                    entry_point: Some("fs_main"),
                    targets: &[Some(wgpu::ColorTargetState {
                        format: config.format,
                        blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                        write_mask: wgpu::ColorWrites::ALL,
                    })],
                    compilation_options: wgpu::PipelineCompilationOptions::default(),
                }),
                primitive: wgpu::PrimitiveState {
                    topology: wgpu::PrimitiveTopology::TriangleList,
                    strip_index_format: None,
                    front_face: wgpu::FrontFace::Ccw,
                    cull_mode: None,
                    unclipped_depth: false,
                    polygon_mode: wgpu::PolygonMode::Fill,
                    conservative: false,
                },
                depth_stencil: None,
                multisample: wgpu::MultisampleState {
                    count: 1,
                    mask: !0,
                    alpha_to_coverage_enabled: false,
                },
                multiview: None,
                cache: None,
            });

        let sprite_vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Sprite Vertex Buffer"),
            contents: bytemuck::cast_slice(boid_sprite::VERTICES),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let sprite_index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Sprite Index Buffer"),
            contents: bytemuck::cast_slice(boid_sprite::INDICES),
            usage: wgpu::BufferUsages::INDEX,
        });

        let line_vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Line Vertex Buffer"),
            contents: bytemuck::cast_slice(thick_line::VERTICES),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let line_index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Line Index Buffer"),
            contents: bytemuck::cast_slice(thick_line::INDICES),
            usage: wgpu::BufferUsages::INDEX,
        });

        //
        // GET DOM ELEMENTS
        //
        let sep_slider = document
            .get_element_by_id("sep-slider")
            .unwrap()
            .dyn_into::<HtmlInputElement>()
            .unwrap();
        sep_slider.set_value("0.5");
        let ali_slider = document
            .get_element_by_id("ali-slider")
            .unwrap()
            .dyn_into::<HtmlInputElement>()
            .unwrap();
        ali_slider.set_value("0.5");
        let coh_slider = document
            .get_element_by_id("coh-slider")
            .unwrap()
            .dyn_into::<HtmlInputElement>()
            .unwrap();
        coh_slider.set_value("0.5");

        Ok(Self {
            surface,
            device,
            queue,
            config,
            is_surface_configured: false,
            window,
            sprite_render_pipeline,
            network_render_pipeline,
            sprite_vertex_buffer,
            sprite_index_buffer,
            line_vertex_buffer,
            line_index_buffer,
            network_lines,
            network_buffer,
            sprite_bind_group,
            screen_size_buffer,
            screen_size_bind_group,
            boids,
            boid_buffer,
            last_frame_time: 0.0,
            sep_slider,
            ali_slider,
            coh_slider,
        })
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        if width > 0 && height > 0 {
            self.config.width = width;
            self.config.height = height;
            self.surface.configure(&self.device, &self.config);
            self.is_surface_configured = true;
            self.queue.write_buffer(
                &self.screen_size_buffer,
                0,
                bytemuck::cast_slice(&window_size_matrix(width, height)),
            );
        }
    }

    fn update(&mut self) {
        let sep_scale = self.sep_slider.value_as_number();
        let ali_scale = self.ali_slider.value_as_number();
        let coh_scale = self.coh_slider.value_as_number();
        let time_now: f32 = web_sys::window().unwrap().performance().unwrap().now() as f32;
        self.network_lines = boids::update_boids(
            &mut self.boids,
            self.config.width as f32,
            self.config.height as f32,
            self.last_frame_time,
            time_now,
            sep_scale as f32,
            ali_scale as f32,
            coh_scale as f32,
            &mut rng::get_rng(),
        );
        self.last_frame_time = time_now;

        self.queue.write_buffer(
            &self.network_buffer,
            0,
            bytemuck::cast_slice(&self.network_lines),
        );
        let boid_data = self
            .boids
            .iter()
            .map(Boid::to_raw)
            .collect::<Vec<BoidRaw>>();

        self.queue
            .write_buffer(&self.boid_buffer, 0, bytemuck::cast_slice(&boid_data));
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        const BACKGROUND_COLOR: wgpu::Color = wgpu::Color {
            r: 0.021,
            g: 0.021,
            b: 0.021,
            a: 1.0,
        };

        self.window.request_redraw();

        if !self.is_surface_configured {
            return Ok(());
        }

        let output = self.surface.get_current_texture()?;

        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });
        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(BACKGROUND_COLOR),
                        store: wgpu::StoreOp::Store,
                    },
                    depth_slice: None,
                })],
                depth_stencil_attachment: None,
                occlusion_query_set: None,
                timestamp_writes: None,
            });

            render_pass.set_pipeline(&self.network_render_pipeline);
            render_pass.set_bind_group(0, &self.screen_size_bind_group, &[]);
            render_pass.set_vertex_buffer(0, self.line_vertex_buffer.slice(..));
            render_pass.set_vertex_buffer(1, self.network_buffer.slice(..));
            render_pass
                .set_index_buffer(self.line_index_buffer.slice(..), wgpu::IndexFormat::Uint16);
            render_pass.draw_indexed(
                0..thick_line::INDICES.len() as u32,
                0,
                0..self.network_lines.len() as _,
            );
            render_pass.set_pipeline(&self.sprite_render_pipeline);
            render_pass.set_bind_group(1, &self.sprite_bind_group, &[]);
            render_pass.set_vertex_buffer(0, self.sprite_vertex_buffer.slice(..));
            render_pass.set_vertex_buffer(1, self.boid_buffer.slice(..));
            render_pass.set_index_buffer(
                self.sprite_index_buffer.slice(..),
                wgpu::IndexFormat::Uint16,
            );
            render_pass.draw_indexed(
                0..boid_sprite::INDICES.len() as u32,
                0,
                0..self.boids.len() as _,
            );
        }

        // submit will accept anything that implements IntoIter
        self.queue.submit(std::iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

fn window_size_matrix(width: u32, height: u32) -> [[f32; 4]; 4] {
    [
        [2.0 / width as f32, 0.0, 0.0, -1.0],
        [0.0, -2.0 / height as f32, 0.0, 1.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ]
}

pub fn run() -> anyhow::Result<()> {
    console_log::init_with_level(log::Level::Info).unwrap_throw();

    let event_loop = EventLoop::with_user_event().build()?;
    let mut app = App::new(&event_loop);
    event_loop.run_app(&mut app)?;

    Ok(())
}

#[wasm_bindgen(start)]
pub fn run_web() -> Result<(), wasm_bindgen::JsValue> {
    console_error_panic_hook::set_once();
    run().unwrap_throw();

    Ok(())
}
