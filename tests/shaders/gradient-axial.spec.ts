import { createFloat2, GRADIENT_AXIAL } from '../../src/main';
import { testShader } from '../utils';

testShader(GRADIENT_AXIAL, {
    diag: {
        point1: createFloat2([0, 0]),
        point2: createFloat2([1, 1]),
    },
    small: {
        point1: createFloat2([0.4, 0.4]),
        point2: createFloat2([0.6, 0.6]),
    },
});
