import { AbstractBuiltinNode } from '../builtin-node';

import type { ExecutionContext, Float4Value, NodeDescriptor, StringValue } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
    const img = new Image();
    img.src = src;

    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

function bgColorToRgba(color: Float4Value): string {
    const [r, g, b, a] = color.value;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

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
        const bgColorValue = this.getProperty<Float4Value>('background')!;

        const texture = this.getOutput('output')!;

        const img = await loadImage(sourceValue.value);

        const { size } = ctx.graph;
        const canvas = new OffscreenCanvas(size, size);
        const canvasCtx = canvas.getContext('2d')!;

        canvasCtx.fillStyle = bgColorToRgba(bgColorValue);
        canvasCtx.fillRect(0, 0, size, size);
        canvasCtx.drawImage(img, 0, 0, size, size);

        const outputImageData = canvasCtx.getImageData(0, 0, size, size);
        const outputBitmap = await createImageBitmap(outputImageData);

        ctx.backend.copyImageToTexture(outputBitmap, texture);
    }
}
