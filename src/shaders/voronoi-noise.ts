import { wgsl } from '../utils/wgsl';

import { noiseHelpers } from './shared/noise';
import { createShaderDescriptor } from './shared/shader-descriptor';

const DISTANCE_MAPPING = {
    Euclidean: 0,
    Manhattan: 1,
    Chebyshev: 2,
};

// https://www.ronja-tutorials.com/post/028-voronoi-noise/
// https://en.wikipedia.org/wiki/Taxicab_geometry
// https://en.wikipedia.org/wiki/Chebyshev_distance
const SOURCE = wgsl`
    ${noiseHelpers}

    fn distance_fn(a: vec2<f32>, b: vec2<f32>) -> f32 {
        switch config.distance {
            case ${DISTANCE_MAPPING.Euclidean}: {
                return length(a - b);
            }
            case ${DISTANCE_MAPPING.Manhattan}: {
                return abs(a.x - b.x) + abs(a.y - b.y);
            }
            case ${DISTANCE_MAPPING.Chebyshev}: {
                return max(abs(a.x - b.x), abs(a.y - b.y));
            }
            default: {
                return 0.0;
            }
        }
    }

    fn run(coordinate: vec2<f32>) -> Output {
        var pos = coordinate * f32(config.scale);
        var min_dist: f32 = 10;

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var cell = floor(pos) + vec2(f32(i), f32(j));
                var cell_position = cell + config.randomness * (rand2(cell) * 0.5 + vec2(0.5));

                min_dist = min(min_dist, distance_fn(pos, cell_position));
            }
        }

        return Output(min_dist);
    }
`;

export default createShaderDescriptor({
    id: '#voronoi-noise',
    label: 'Voronoi Noise',
    source: SOURCE,
    properties: {
        scale: {
            label: 'Scale',
            type: 'int1',
            description: 'The global scale of the noise.',
            default: [8],
        },
        randomness: {
            label: 'Randomness',
            type: 'float1',
            description: 'The randomness of the noise.',
            default: [1],
        },
        distance: {
            label: 'Distance',
            type: 'int1',
            description: 'The distance metric to use.',
            default: [DISTANCE_MAPPING.Euclidean],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
});
