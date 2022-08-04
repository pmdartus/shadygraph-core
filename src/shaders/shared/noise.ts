import { wgsl } from '../../utils/wgsl';

export const noiseHelpers = wgsl`
    fn rand(xy: vec2<f32>) -> f32 {
        return fract(sin(dot(xy * config.attr_seed, vec2(12.9898, 78.233))) * 43758.5453);
    }
`;
