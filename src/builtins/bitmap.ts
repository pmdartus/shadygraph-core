import { Backend, Texture } from '../types';

export async function loadBitmapToTexture(
    backend: Backend,
    url: string,
    texture: Texture,
): Promise<void> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to image fetch at "${url}".`);
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    backend.copyImageToTexture(bitmap, texture);
}
