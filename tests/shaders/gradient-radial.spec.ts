import { createFloat1, createFloat2, GRADIENT_RADIAL } from '../../src/main';
import { testShader } from '../utils';

testShader(GRADIENT_RADIAL, {
    default: {
        center: createFloat2([0.5, 0.5]),
        radius: createFloat1([0.3]),
    },
});
