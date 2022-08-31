export async function withGpuErrors<T>(device: GPUDevice, fn: () => T): Promise<T> {
    device.pushErrorScope('validation');
    device.pushErrorScope('out-of-memory');

    const res = await fn();

    const errors = await Promise.all([device.popErrorScope(), device.popErrorScope()]);

    const wgpuError = errors.find((val) => val !== null);
    if (wgpuError) {
        // Print error message.
        console.error(wgpuError);

        // Re-wrap GPU errors in standard errors. GPU errors can't be cloned.
        let error: Error;
        if (wgpuError instanceof GPUValidationError) {
            error = new Error('[GPUValidationError] ' + wgpuError.message);
        } else if (wgpuError instanceof GPUOutOfMemoryError) {
            error = new Error(
                '[GPUOutOfMemoryError] Operation failed due to an out of memory error.',
            );
        } else {
            error = new Error(`[GPUnError] Unknown error ${wgpuError}`);
        }

        throw error;
    }

    return res;
}
