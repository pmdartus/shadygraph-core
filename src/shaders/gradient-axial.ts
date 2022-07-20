import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const SOURCE = wgsl`
    const POINT_SIZE = 0.03;

    fn run(coordinate: vec2<f32>) -> Output {
        var u = coordinate - config.point1;
        var v = config.point2 - config.point1;

        var value = dot(v, u) / length(v);

        if (distance(coordinate, config.point1) < POINT_SIZE) {
            return Output(vec4<f32>(0, 1, 0, 1.0));
        }

        if (distance(coordinate, config.point2) < POINT_SIZE) {
            return Output(vec4<f32>(0, 0, 1, 1.0));
        }
        
        return Output(vec4<f32>(value, value, value, 1));
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
            type: 'color',
        },
    },
};
