import { AbstractBuiltinNode, ExecutionContext } from '../node';

import type { Int4Value, NodeDescriptor, StringValue } from '../types';

export class SvgNode extends AbstractBuiltinNode {
    static get descriptor(): NodeDescriptor {
        return {
            properties: {
                source: {
                    label: 'Source',
                    type: 'string',
                    description: 'The image source URL.',
                    default: '',
                },
                background: {
                    label: 'Background color',
                    type: 'float4',
                    description: 'The background color of the SVG.',
                    default: [0, 0, 0, 1],
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
        const bgColorValue = this.getProperty<Int4Value>('background')!;

        const texture = this.getOutput('output')!;

        const response = await fetch(sourceValue.value);
        if (!response.ok) {
            throw new Error(`Failed to image fetch at "${sourceValue.value}".`);
        }

        const blob = await response.blob();
        const svgBitmap = await createImageBitmap(blob);

        const { size } = ctx.graph;

        const canvas = new OffscreenCanvas(size, size);
        const canvasCtx = canvas.getContext('2d')!;

        canvasCtx.fillStyle = `rgba(${bgColorValue.value.join(',')})`;
        canvasCtx.fillRect(0, 0, size, size);
        canvasCtx.drawImage(svgBitmap, 0, 0, size, size);

        const outputImageData = canvasCtx.getImageData(0, 0, size, size);
        const outputBitmap = await createImageBitmap(outputImageData);

        ctx.backend.copyImageToTexture(outputBitmap, texture);
    }
}
