import { createFloat3, UNIFORM_COLOR } from '../../src/main';
import { testShader } from '../utils';

testShader(UNIFORM_COLOR, {
    gray: {
        color: createFloat3([0.5, 0.5, 0.5]),
    },
    red: {
        color: createFloat3([1, 0, 0]),
    },
    white: {
        color: createFloat3([1, 1, 1]),
    },
});
