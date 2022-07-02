import { assertValueType } from './value';
import { propertyTypeDefaultValue } from './shader-descriptor';

import { uuid } from './utils/uuid';

import type { Node, NodeConfig, ShaderDescriptor, Value } from './types';

interface NodeInternalConfig extends NodeConfig {
    getShaderDescriptor(shader: string): ShaderDescriptor | undefined;
}

function createPropertiesProxy(
    config: NodeInternalConfig,
    propertyChanged?: (target: string, value: Value) => void,
): Record<string, Value | undefined> {
    const { shader, getShaderDescriptor } = config;

    function getExistingShaderDescriptor(shader: string): ShaderDescriptor {
        const descriptor = getShaderDescriptor(shader);
        if (!descriptor) {
            throw new Error('Shader not found');
        }

        return descriptor;
    }

    function getValue(target: { [name: string]: Value }, key: string): Value | undefined {
        if (key in target) {
            return target[key];
        }

        const shaderDescriptor = getExistingShaderDescriptor(shader);
        const propertyType = shaderDescriptor.properties[key];

        return propertyTypeDefaultValue(propertyType);
    }

    return new Proxy(
        {},
        {
            get: getValue,
            set(target, key: string, value: Value) {
                const shaderDescriptor = getExistingShaderDescriptor(shader);
                const propertyType = shaderDescriptor.properties[key];

                if (!propertyType) {
                    throw new Error(`Property ${key} does not exist in shader ${shader}`);
                }

                assertValueType(value, propertyType.type);

                target[key] = value;
                propertyChanged?.(key, value);

                return true;
            },
            ownKeys() {
                const shaderDescriptor = getExistingShaderDescriptor(shader);
                return Object.keys(shaderDescriptor.properties);
            },
            has(target, key) {
                const shaderDescriptor = getExistingShaderDescriptor(shader);
                return Object.hasOwn(shaderDescriptor.properties, key);
            },
            getOwnPropertyDescriptor(target, key: string) {
                const value = getValue(target, key);
                return {
                    value,
                    enumerable: true,
                    writable: true,
                    configurable: true,
                };
            },
        },
    );
}

export function createNode(config: NodeInternalConfig): Node {
    const { shader } = config;

    let isDirty = true;

    const id = uuid();
    const properties = createPropertiesProxy(config, () => {
        isDirty = true;
    });

    return {
        id,
        shader,
        properties,
        get isDirty() {
            return isDirty;
        },
        async renderNode() {},
    };
}
