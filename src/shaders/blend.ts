import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const BLEND_MODE_MAPPING = {
    Normal: 0,
    Add: 1,
    Subtract: 2,
    Multiply: 3,
    Divide: 4,
    AddSub: 5,
    Max: 6,
    Min: 7,
    Overlay: 8,
    Screen: 9,
};

// https://en.wikipedia.org/wiki/Blend_modes
// https://substance3d.adobe.com/documentation/sddoc/blending-modes-description-132120605.html
const SOURCE = wgsl`
    fn rgb_to_gray(val: vec3<f32>) -> f32 {
        return 0.299 * val.r + 0.587 * val.g + 0.114 * val.b;
    }

    fn run(coordinate: vec2<f32>) -> Output {
        var foreground = textureSample(foreground_texture, foreground_sampler, coordinate).rgb;
        var background = textureSample(background_texture, background_sampler, coordinate).rgb;

        // Apply the blend mode to the output.
        var output: vec3<f32>;
        switch config.mode {
            case ${BLEND_MODE_MAPPING.Normal}: {
                output = foreground;
            }
            case ${BLEND_MODE_MAPPING.Add}: {
                output = background + foreground;
            }
            case ${BLEND_MODE_MAPPING.Subtract}: {
                output = background - foreground;
            }
            case ${BLEND_MODE_MAPPING.Multiply}: {
                output = background * foreground;
            }
            case ${BLEND_MODE_MAPPING.Divide}: {
                output = background / foreground;
            }
            case ${BLEND_MODE_MAPPING.AddSub}: {
                if rgb_to_gray(foreground) > 0.5 {
                    output = background + foreground;
                } else {
                    output = background - foreground;
                }
            }
            case ${BLEND_MODE_MAPPING.Max}: {
                output = max(background, foreground);
            }
            case ${BLEND_MODE_MAPPING.Min}: {
                output = min(background, foreground);
            }
            case ${BLEND_MODE_MAPPING.Overlay}: {
                if rgb_to_gray(background) < 0.5 {
                    output = 2 * background * foreground;
                } else {
                    output = vec3<f32>(1.0) - 2 * (vec3<f32>(1) - background) * (vec3<f32>(1) - foreground);
                }
            }
            case ${BLEND_MODE_MAPPING.Screen}: {
                output = vec3<f32>(1.0) - (vec3<f32>(1) - background) * (vec3<f32>(1) - foreground);
            }

            default { 
                // Do nothing in the default case
            }
        }

        // Finally apply by mixing the output with the background.
        output = mix(background, output, config.opacity);

        return Output(vec4<f32>(output, 1.0));
    }
`;

export const BLEND: ShaderDescriptor = {
    id: '#blend',
    label: 'Blend',
    source: SOURCE,
    properties: {
        opacity: {
            label: 'Opacity',
            type: 'float1',
            description: 'Opacity of the foreground layer blending.',
            default: [1],
        },
        mode: {
            label: 'Blending Mode',
            type: 'int1',
            description: 'Set the blending mode.',
            default: [0],
        },
    },
    inputs: {
        foreground: {
            label: 'Foreground',
            type: 'color',
        },
        background: {
            label: 'Background',
            type: 'color',
        },
        // TODO: Add opacity map input.
        // opacity: {
        //     label: 'Opacity',
        //     type: 'grayscale',
        // },
    },
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
};
