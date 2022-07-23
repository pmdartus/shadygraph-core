import { wgsl } from '../../utils/wgsl';

export const colorHelpers = wgsl`
    // Converting RGB to grayscale using the weighted average method.
    fn rgb_to_grayscale(val: vec3<f32>) -> f32 {
        return 0.299 * val.r + 0.587 * val.g + 0.114 * val.b;
    }
`;
