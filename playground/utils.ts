export function createPreviewCanvas() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    canvas.width = 512;
    canvas.height = 512;

    canvas.style.width = `30px`;
    canvas.style.height = `30px`;

    return canvas;
}