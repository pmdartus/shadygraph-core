import { createNodeDescriptor } from './utils';

export default createNodeDescriptor({
    id: '#output',
    label: 'Output',
    properties: {},
    inputs: {
        input: {
            label: 'Input',
            type: 'color',
        },
    },
    outputs: {},
    execute(_ctx) {
        throw new Error('Not implemented.');
    },
});
