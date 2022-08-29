import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const MODE_MAPPING = {
    Gt: 0,
    Gte: 1,
    Lt: 2,
    Lte: 3,
};

const SOURCE = wgsl`
    const CENTER = vec2<f32>(0.5, 0.5);

    fn run(coordinate: vec2<f32>) -> Output {
        var input = textureSample(input_texture, input_sampler, coordinate).r;

        var output = false;
        switch (config.mode) {
            case ${MODE_MAPPING.Gt}: {
                output = input > config.value;
            }
            case ${MODE_MAPPING.Gte}: {
                output = input >= config.value;
            }
            case ${MODE_MAPPING.Lt}: {
                output = input < config.value;
            }
            case ${MODE_MAPPING.Lte}: {
                output = input <= config.value;
            }
            default: {
                // Do nothing
            }
        }

        return Output(f32(output));
    }
`;

export default createShaderDescriptor({
    id: '#threshold',
    label: 'Threshold',
    source: SOURCE,
    properties: {
        value: {
            label: 'Value',
            type: 'float1',
            description: 'The value to compare against.',
            default: [0.5],
        },
        mode: {
            label: 'Mode',
            type: 'int1',
            description: 'The comparison function to use against each pixel.',
            default: [MODE_MAPPING.Gt],
        },
    },
    inputs: {
        input: {
            label: 'Input',
            type: 'grayscale',
        },
    },
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
});
