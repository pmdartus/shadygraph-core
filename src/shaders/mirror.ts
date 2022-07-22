import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const MIRROR_MODE_MAPPING = {
    X_AXIS: 0,
    Y_AXIS: 1,
    XY_AXIS: 2,
};

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var mirror_x = mix(coordinate.x, 1.0 - coordinate.x, step(config.x_offset, coordinate.x));
        var mirror_y = mix(coordinate.y, 1.0 - coordinate.y, step(config.y_offset, coordinate.y));

        var mirror_coordinate = vec2<f32>(coordinate);
        switch config.mode {
            case ${MIRROR_MODE_MAPPING.X_AXIS}: {
                mirror_coordinate.x = mirror_x;
            }
            case ${MIRROR_MODE_MAPPING.Y_AXIS}: {
                mirror_coordinate.y = mirror_y;
            }
            case ${MIRROR_MODE_MAPPING.XY_AXIS}: {
                mirror_coordinate.x = mirror_x;
                mirror_coordinate.y = mirror_y;
            }

            default: {
                // Do nothing in the default case.
            }
        }

        var val = textureSample(input_texture, input_sampler, mirror_coordinate);
        return Output(val);
    }
`;

export const MIRROR: ShaderDescriptor = {
    id: '#mirror',
    label: 'Mirror',
    source: SOURCE,
    properties: {
        mode: {
            label: 'Mode',
            type: 'int1',
            description: 'Apply left/right, top/bottom or both direction mirroring.',
            default: [MIRROR_MODE_MAPPING.X_AXIS],
        },
        x_offset: {
            label: 'X Offset',
            type: 'float1',
            description: 'Defines the mirror offset on X.',
            default: [0.5],
        },
        y_offset: {
            label: 'Y Offset',
            type: 'float1',
            description: 'Defines the mirror offset on Y.',
            default: [0.5],
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
};
