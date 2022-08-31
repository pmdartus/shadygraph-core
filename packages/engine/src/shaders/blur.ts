import { wgsl } from '../utils/wgsl';

import { createShaderDescriptor } from './shared/shader-descriptor';

// This algorithm is based on box blur: https://en.wikipedia.org/wiki/Box_blur
// This implementation is quite slow. This could be improved by doing multiple passes.
// https://observablehq.com/@jobleonard/mario-klingemans-stackblur
const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var step = 1 / f32(config.attr_size);

        let origin = vec2<f32>(
            coordinate.x - step * f32(config.intensity) / 2,
            coordinate.y - step * f32(config.intensity) / 2,
        );

        var sum = vec3<f32>(0.0);

        for (var x: u32 = 0; x < config.intensity; x++) {
            for (var y: u32 = 0; y < config.intensity; y++) {
                var offset = fract(origin + vec2<f32>(f32(x) * step, f32(y) * step));
                sum += textureSample(input_texture, input_sampler, offset).rgb;
            }
        }

        var value = sum / f32(config.intensity * config.intensity);

        return Output(vec4(value, 1.0));
    }
`;

export default createShaderDescriptor({
    id: '#blur',
    label: 'Blur',
    source: SOURCE,
    properties: {
        intensity: {
            label: 'Itensity',
            type: 'int1',
            description: 'The intensity of the blur.',
            default: [5],
        },
    },
    inputs: {
        input: {
            label: 'Input',
            type: 'color',
        },
    },
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
});
