import { withGpuErrors } from './utils';

export function createShaderModule(
    device: GPUDevice,
    descriptor: GPUShaderModuleDescriptor,
): Promise<GPUShaderModule> {
    // TODO: Add better error handling.
    // https://github.com/toji/webgpu-shadow-playground/blob/979b60bfe356b32cd874cbaec64ac54d54757e47/js/engine/webgpu/wgsl/wgsl-utils.js
    return withGpuErrors(device, () => device.createShaderModule(descriptor));
}
