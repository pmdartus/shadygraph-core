import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    const POINT_SIZE = 0.03;

    fn run(coordinate: vec2<f32>) -> Output {
        var u = coordinate - config.point1;
        var v = config.point2 - config.point1;

        var value = dot(v, u) / length(v);
        return Output(vec4<f32>(value, value, value, 1));
    }
`;

export default createShaderDescriptor({
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
});
