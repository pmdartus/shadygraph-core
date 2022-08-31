import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    fn translation_matrix(offset: vec2<f32>) -> mat3x3<f32> {
        return mat3x3(
            1, 0, offset.x,
            0, 1, offset.y,
            0, 0, 1,
        );
    }

    fn scale_matrix(scale: vec2<f32>) -> mat3x3<f32> {
        return mat3x3(
            scale.x, 0, 0,
            0, scale.y, 0,
            0, 0, 1,
        );
    }

    fn rotation_matrix(angle: f32) -> mat3x3<f32> {
        return mat3x3(
            cos(angle), -sin(angle), 0,
            sin(angle), cos(angle), 0,
            0, 0, 1,
        );
    }

    fn shear_matrix(shear: vec2<f32>) -> mat3x3<f32> {
        return mat3x3(
            1, shear.y, 0,
            shear.x, 1, 0,
            0, 0, 1,
        );
    }

    fn run(coordinate: vec2<f32>) -> Output {
        var transformation_matrix = 
            translation_matrix(vec2(-0.5, -0.5)) * 
            rotation_matrix(config.rotation) *
            scale_matrix(config.scale) *
            shear_matrix(config.shear) *
            translation_matrix(config.translation) * 
            translation_matrix(vec2(0.5, 0.5));

        var transformed_coordinate = vec3(coordinate, 1.0) * transformation_matrix;

        var value = textureSample(input_texture, input_sampler, fract(transformed_coordinate.xy));
        return Output(value);
    }
`;

export default createShaderDescriptor({
    id: '#transform-2d',
    label: 'Transform 2D',
    source: SOURCE,
    properties: {
        translation: {
            label: 'Translation',
            type: 'float2',
            description: 'The translation amount.',
            default: [0, 0],
        },
        rotation: {
            label: 'Rotation',
            type: 'float1',
            description: 'The rotation amount.',
            default: [0],
        },
        scale: {
            label: 'Scale',
            type: 'float2',
            description: 'The scaling amount.',
            default: [1, 1],
        },
        shear: {
            label: 'Shear',
            type: 'float2',
            description: 'The shear amount.',
            default: [0, 0],
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
