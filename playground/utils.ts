import { Texture } from '../src/types';

export async function textureToCanvas(texture: Texture, canvas: HTMLCanvasElement): Promise<void> {
    const { size: width, size: height } = texture;
    
    const data = await texture.getData();
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
}
