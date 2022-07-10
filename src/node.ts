import { assertValueType } from './value';
import { propertyTypeDefaultValue } from './shader-descriptor';

import { uuid } from './utils/uuid';

import type { Engine, Graph, Node, NodeConfig, ShaderDescriptor, Texture, Value } from './types';

function createPropertiesProxy(
    config: NodeConfig,
    engine: Engine,
    propertyChanged?: (target: string, value: Value) => void,
): Record<string, Value> {
    const { shader, properties = {} } = config;

    function getExistingShaderDescriptor(shader: string): ShaderDescriptor {
        return engine.getShaderDescriptor(shader)!;
    }

    function getValue(target: { [name: string]: Value }, key: string): Value | undefined {
        if (key in target) {
            return target[key];
        }

        const shaderDescriptor = getExistingShaderDescriptor(shader);
        const propertyType = shaderDescriptor.properties[key];

        return propertyTypeDefaultValue(propertyType);
    }

    return new Proxy(properties, {
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
    });
}

export function createNode(config: NodeConfig, engine: Engine, graph: Graph): Node {
    const { id = uuid(), shader } = config;

    let isDirty = true;

    const properties = createPropertiesProxy(config, engine, () => {
        isDirty = true;
    });

    const shaderDescriptor = engine.getShaderDescriptor(shader)!;

    const outputs = Object.fromEntries(
        Object.entries(shaderDescriptor.outputs).map(([outputId, output]) => {
            const texture = engine.backend.createTexture({
                label: `${id}:${shaderDescriptor.id}:${outputId}`,
                type: output.type,
                size: 512,
            });

            return [outputId, texture];
        }),
    );

    return {
        id,
        shader,
        properties,
        outputs,
        get inputs() {
            const inputs: Record<string, Texture | null> = Object.fromEntries(
                Object.keys(shaderDescriptor.inputs).map((inputId) => [inputId, null]),
            );

            for (const edge of graph.edges()) {
                if (edge.to.id === id) {
                    inputs[edge.toPort] = edge.from.outputs[edge.fromPort];
                }
            }

            return inputs;
        },
        get isDirty() {
            return isDirty;
        },
    };
}
