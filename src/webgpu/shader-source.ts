import { wgsl } from '../utils/wgsl';

export const VERTEX_SHADER_CODE = wgsl`
    // https://www.w3.org/TR/webgpu/#coordinate-systems
    // Normalized devices coordinate (NDC) - where X and Y are between -1 and 1 and the (-1, -1) 
    // coordinate is located at the bottom left corner.

    struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) coordinate: vec2<f32>,
    };

    @vertex
    fn main(
        @builtin(vertex_index) index : u32,
    ) -> VertexOutput {
        var positions = array<vec2<f32>, 6>(
            vec2<f32>( 1.0,  1.0),
            vec2<f32>( 1.0, -1.0),
            vec2<f32>(-1.0, -1.0),
            vec2<f32>( 1.0,  1.0),
            vec2<f32>(-1.0, -1.0),
            vec2<f32>(-1.0,  1.0)
        );
        
        var coordinates = array<vec2<f32>, 6>(
            vec2<f32>(1.0, 0.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 0.0),
            vec2<f32>(0.0, 1.0),
            vec2<f32>(0.0, 0.0)
        );

        var out: VertexOutput;
        out.position = vec4<f32>(positions[index], 0.0, 1.0);
        out.coordinate = coordinates[index];
        return out;
    }
`;

export const FRAGMENT_SHADER_FULLSCREEN_GRAYSCALE_CODE = wgsl`
    @group(0) @binding(0) var input_texture: texture_2d<f32>;
    @group(0) @binding(1) var input_sampler: sampler;

    @fragment
    fn main(@location(0) coordinate: vec2<f32>) -> @location(0) vec4<f32> {
        return textureSample(input_texture, input_sampler, coordinate);
    }
`;

export const FRAGMENT_SHADER_FULLSCREEN_COLOR_CODE = wgsl`
    @group(0) @binding(0) var input_texture: texture_2d<f32>;
    @group(0) @binding(1) var input_sampler: sampler;

    @fragment
    fn main(@location(0) coordinate: vec2<f32>) -> @location(0) vec4<f32> {
        return textureSample(input_texture, input_sampler, coordinate);
    }
`;
