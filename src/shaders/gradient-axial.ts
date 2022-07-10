import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var value = dot(coordinate - config.point1, config.point2);
        return Output(value);
    }
`;

export const GRADIENT_AXIAL: ShaderDescriptor = {
    id: '#gradient-axial',
    label: 'Gradient Axial',
    source: SOURCE,
    properties: {
        point1: {
            label: 'Point 1',
            type: 'float2',
            description: 'The gradient start position.',
            default: [0.2, 0.2],
        },
        point2: {
            label: 'Point 2',
            type: 'float2',
            description: 'The gradient end position.',
            default: [0.8, 0.8],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
};
