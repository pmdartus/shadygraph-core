import { createNodeDescriptor } from './utils';

export default createNodeDescriptor({
    id: '#input',
    label: 'Input',
    properties: {},
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
    execute(_ctx) {
        throw new Error('Not implemented.');
    },
});
