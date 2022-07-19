export function createPreviewCanvas(
    target: HTMLElement = document.body,
    size = 30,
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    target.appendChild(canvas);

    canvas.width = 512;
    canvas.height = 512;

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    return canvas;
}
