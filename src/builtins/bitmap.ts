import { AbstractBuiltinNode } from '../builtin-node';

import type { ExecutionContext, NodeDescriptor, StringValue } from '../types';

export class BitmapNode extends AbstractBuiltinNode {
    static get descriptor(): NodeDescriptor {
        return {
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
        };
    }

    async execute(ctx: ExecutionContext): Promise<void> {
        const sourceValue = this.getProperty<StringValue>('source')!;

        const response = await fetch(sourceValue.value);
        if (!response.ok) {
            throw new Error(`Failed to image fetch at "${sourceValue.value}".`);
        }

        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        const texture = this.getOutput('output')!;
        ctx.backend.copyImageToTexture(bitmap, texture);
    }
}
