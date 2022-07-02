import { Backend } from "../types";

export async function createWebGPUBackend(): Promise<Backend> {
    if (!('gpu' in navigator)) {
        throw new Error('GPU not supported in this browser.');
    }

    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
    });

    if (adapter === null) {
        throw new Error('Failed to instantiate GPU adapter.');
    }

    const device = await adapter.requestDevice();

    return {
        async compileShader(descriptor) {
            return {
                success: true,
                shader: {},
            };
        },
    };
}