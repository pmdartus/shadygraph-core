import { wgsl } from '../utils/wgsl';

import type { Value, ShaderDescriptor, ValueType } from '../types';

enum ConfigMemberKind {
    Attribute,
    Property,
}

interface ConfigMemberDescriptor {
    kind: ConfigMemberKind;
    type: ValueType;
    offset: number;
}

interface ConfigStructDescriptor {
    id: string;
    size: number;
    alignment: number;
    members: Record<string, ConfigMemberDescriptor>;
}

const KNOWN_ATTRIBUTES: Record<string, ValueType> = {
    seed: 'float1',
};

export class ShaderConfig {
    #device: GPUDevice;
    #buffer: GPUBuffer;
    #arrayBuffer: ArrayBuffer;
    #desc: ConfigStructDescriptor;

    constructor(device: GPUDevice, desc: ConfigStructDescriptor) {
        this.#device = device;
        this.#desc = desc;

        this.#arrayBuffer = new ArrayBuffer(this.#desc.size);
        this.#buffer = device.createBuffer({
            label: `Buffer:Properties:${this.#desc.id}`,
            size: this.#desc.size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    get buffer() {
        return this.#buffer;
    }

    toWgsl(): string {
        return wgsl`
            struct Config {
                ${Object.entries(this.#desc.members).map(
                    ([key, prop], index) =>
                        `@location(${index}) ${key} : ${wsglValueType(prop.type)},`,
                )}
            };
        `;
    }

    writePropertiesBuffer(
        attributes: Record<string, Value>,
        properties: Record<string, Value>,
    ): void {
        for (const [key, member] of Object.entries(this.#desc.members)) {
            let value: Value;

            if (member.kind === ConfigMemberKind.Attribute) {
                value = attributes[key];
                if (!value) {
                    throw new Error(`Attribute ${key} is missing`);
                }
            } else if (member.kind === ConfigMemberKind.Property) {
                value = properties[key];
                if (!value) {
                    throw new Error(`Property ${key} is missing`);
                }
            }

            setPropertyValue(this.#arrayBuffer, value!, member.offset);
        }

        this.#device.queue.writeBuffer(this.#buffer, 0, this.#arrayBuffer);
    }

    destroy(): void {
        this.#buffer.destroy();
    }

    static create(device: GPUDevice, shader: ShaderDescriptor): ShaderConfig {
        const configDesc = createConfigDescriptor(shader);
        return new ShaderConfig(device, configDesc);
    }
}

function createConfigDescriptor(shader: ShaderDescriptor): ConfigStructDescriptor {
    let currentOffset = 0;
    let structAlignment = 0;
    const members: Record<string, ConfigMemberDescriptor> = {};

    for (const [id, type] of Object.entries(KNOWN_ATTRIBUTES)) {
        const valueSize = sizeOfValue(type);
        const valueAlignment = alignmentOfProperty(type);
        const valueOffset = Math.ceil(currentOffset / valueAlignment) * valueAlignment;

        members[id] = {
            kind: ConfigMemberKind.Attribute,
            type: type,
            offset: valueOffset,
        };

        currentOffset = valueOffset + valueSize;
        structAlignment = Math.max(structAlignment, valueAlignment);
    }

    for (const [id, { type }] of Object.entries(shader.properties)) {
        const valueSize = sizeOfValue(type);
        const valueAlignment = alignmentOfProperty(type);
        const valueOffset = Math.ceil(currentOffset / valueAlignment) * valueAlignment;

        members[id] = {
            kind: ConfigMemberKind.Property,
            type: type,
            offset: valueOffset,
        };

        currentOffset = valueOffset + valueSize;
        structAlignment = Math.max(structAlignment, valueAlignment);
    }

    if (structAlignment !== 0) {
        currentOffset = Math.ceil(currentOffset / structAlignment) * structAlignment;
    }

    return {
        id: shader.id,
        size: currentOffset,
        alignment: structAlignment,
        members,
    };
}

function sizeOfValue(type: ValueType): number {
    switch (type) {
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

        case 'string':
            throw new Error('String properties are not supported');
    }
}

function alignmentOfProperty(type: ValueType): number {
    switch (type) {
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

        case 'string':
            throw new Error('String properties are not supported');
    }
}

function wsglValueType(type: ValueType): string {
    switch (type) {
        case 'boolean':
            return 'u32';

        case 'int1':
            return 'u32';
        case 'int2':
            return 'vec2<u32>';
        case 'int3':
            return 'vec3<u32>';
        case 'int4':
            return 'vec4<u32>';

        case 'float1':
            return 'f32';
        case 'float2':
            return 'vec2<f32>';
        case 'float3':
            return 'vec3<f32>';
        case 'float4':
            return 'vec4<f32>';

        case 'string':
            throw new Error('String properties are not supported');
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
