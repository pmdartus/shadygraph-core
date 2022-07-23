import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    const POINT_SIZE = 0.03;

    fn run(coordinate: vec2<f32>) -> Output {
        var value = 1.0 - distance(coordinate, config.center) / config.radius;
        return Output(value);
    }
`;

export default createShaderDescriptor({
    id: '#gradient-radial',
    label: 'Gradient Radial',
    source: SOURCE,
    properties: {
        center: {
            label: 'Center',
            type: 'float2',
            description: 'The center of the gradient. Starts white.',
            default: [0.5, 0.5],
        },
        radius: {
            label: 'Radius',
            type: 'float1',
            description: 'The gradient radius. Starts black.',
            default: [0.2],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
});
