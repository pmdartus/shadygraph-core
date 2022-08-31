import { wgsl } from '../../utils/wgsl';

export const noiseHelpers = wgsl`
    fn rand(xy: vec2<f32>) -> f32 {
        return fract(sin(dot(xy * config.attr_seed, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // From: https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
    fn rand2(xy: vec2<f32>) -> vec2<f32> {
        var st = vec2(
            dot(xy, vec2(127.1, 311.7)),
            dot(xy, vec2(269.5, 183.3)) 
        );

        return -1 + 2 * fract(sin(st) * 43758.5453);
    }
`;
