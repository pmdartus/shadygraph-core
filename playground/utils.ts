export function createPreviewCanvas(target = document.body) {
    const canvas = document.createElement('canvas');
    target.appendChild(canvas);

    canvas.width = 512;
    canvas.height = 512;

    canvas.style.width = `30px`;
    canvas.style.height = `30px`;

    return canvas;
}
