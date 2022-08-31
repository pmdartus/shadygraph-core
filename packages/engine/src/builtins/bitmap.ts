import { createNodeDescriptor } from './utils';
import type { StringValue } from '../types';

export default createNodeDescriptor({
    id: '#bitmap',
    label: 'Bitmap',
    properties: {
        source: {
            label: 'Source',
            type: 'string',
            description: 'The image source URL.',
            default: '',
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
    async execute(ctx) {
        const sourceValue = ctx.getProperty<StringValue>('source');

        const response = await fetch(sourceValue.value);
        if (!response.ok) {
            throw new Error(`Failed to image fetch at "${sourceValue.value}".`);
        }

        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        const texture = ctx.getOutput('output');
        ctx.backend.copyImageToTexture(bitmap, texture);
    },
});
