import type { Value, PropertyType, ShaderDescriptor } from '../types';

interface PropertiesBufferInfo {
    size: number;
    alignment: number;
    offsets: Record<string, number>;
}

export class PropertiesBuffer {
    #device: GPUDevice;
    #buffer: GPUBuffer;
    #arrayBuffer: ArrayBuffer;
    #info: PropertiesBufferInfo;

    constructor(device: GPUDevice, shader: ShaderDescriptor) {
        this.#device = device;

        this.#info = getPropertiesBufferInfo(shader.properties);
        this.#arrayBuffer = new ArrayBuffer(this.#info.size);
        this.#buffer = device.createBuffer({
            label: `Buffer:Properties:${shader.id}`,
            size: this.#info.size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    get buffer() {
        return this.#buffer;
    }

    writePropertiesBuffer(properties: Record<string, Value>): void {
        for (const [key, offset] of Object.entries(this.#info.offsets)) {
            const value = properties[key];
            if (!value) {
                throw new Error(`Missing property "${key}".`);
            }

            setPropertyValue(this.#arrayBuffer, properties[key], offset);
        }

        this.#device.queue.writeBuffer(this.#buffer, 0, this.#arrayBuffer);
    }

    destroy(): void {
        this.#buffer.destroy();
    }
}

function getPropertiesBufferInfo(properties: Record<string, PropertyType>): PropertiesBufferInfo {
    let currentOffset = 0;
    let structAlignment = 0;
    const offsets: Record<string, number> = {};

    for (const [id, property] of Object.entries(properties)) {
        const valueSize = sizeOfProperty(property);
        const valueAlignment = alignmentOfProperty(property);
        const valueOffset = Math.ceil(currentOffset / valueAlignment) * valueAlignment;

        offsets[id] = valueOffset;

        currentOffset = valueOffset + valueSize;
        structAlignment = Math.max(structAlignment, valueAlignment);
    }

    if (structAlignment !== 0) {
        currentOffset = Math.ceil(currentOffset / structAlignment) * structAlignment;
    }

    return {
        size: currentOffset,
        alignment: structAlignment,
        offsets,
    };
}

function sizeOfProperty(property: PropertyType): number {
    switch (property.type) {
        case 'boolean':
        case 'float1':
        case 'int1':
            return 4;

        case 'float2':
        case 'int2':
            return 8;

        case 'float3':
        case 'int3':
            return 12;

        case 'float4':
        case 'int4':
            return 16;
    }
}

function alignmentOfProperty(property: PropertyType): number {
    switch (property.type) {
        case 'boolean':
        case 'float1':
        case 'int1':
            return 4;

        case 'float2':
        case 'int2':
            return 8;

        case 'float3':
        case 'int3':
        case 'float4':
        case 'int4':
            return 16;
    }
}

function setPropertyValue(buffer: ArrayBuffer, value: Value, offset: number): void {
    switch (value.type) {
        case 'boolean': {
            const view = new Uint8Array(buffer, offset);
            view.set([value.value ? 1 : 0]);
            break;
        }

        case 'float1':
        case 'float2':
        case 'float3':
        case 'float4': {
            const view = new Float32Array(buffer, offset);
            view.set(value.value);
            break;
        }

        case 'int1':
        case 'int2':
        case 'int3':
        case 'int4': {
            const view = new Int32Array(buffer, offset);
            view.set(value.value);
            break;
        }
    }
}
