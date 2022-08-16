import { createValue } from './value';
import { uuid } from './utils/uuid';

import type { ExecutionContext, Node, NodeDescriptor, IOType, Texture, Value } from './types';

export interface NodeConfig {
    id?: string;
    descriptor: NodeDescriptor;
    properties?: Record<string, Value>;
    outputs?: Record<string, Texture>;
}

export interface BaseSerializedNode {
    id: string;
    properties: Record<string, Value>;
}

export class NodeImpl implements Node {
    readonly id: string;
    #descriptor: NodeDescriptor;
    #properties: Record<string, Value>;
    outputs: Record<string, Texture>;

    constructor(config: NodeConfig) {
        this.id = config.id ?? uuid();
        this.#descriptor = config.descriptor;
        this.#properties = config.properties ?? {};
        this.outputs = config.outputs ?? {};
    }

    get label() {
        return this.#descriptor.label;
    }

    getInput(name: string): IOType | null {
        const { inputs } = this.#descriptor;
        return Object.hasOwn(inputs, name) ? inputs[name] : null;
    }
    getInputs(): Record<string, IOType> {
        return this.#descriptor.inputs;
    }

    getOutput(name: string): IOType | null {
        const { outputs } = this.#descriptor;
        return Object.hasOwn(outputs, name) ? outputs[name] : null;
    }
    getOutputs(): Record<string, IOType> {
        return this.#descriptor.outputs;
    }

    getProperty<T extends Value>(name: string): T | null {
        if (!Object.hasOwn(this.#descriptor.properties, name)) {
            return null;
        }

        if (Object.hasOwn(this.#properties, name)) {
            return this.#properties[name] as T;
        } else {
            const propertyDescriptor = this.#descriptor.properties[name];
            return createValue<T>(propertyDescriptor.type, propertyDescriptor.default);
        }
    }
    getProperties(): Record<string, Value> {
        return Object.fromEntries(
            Object.keys(this.#descriptor.properties).map((name) => [name, this.getProperty(name)!]),
        );
    }

    toJSON(): BaseSerializedNode {
        return {
            id: this.id,
            properties: this.#properties,
        };
    }

    execute(ctx: ExecutionContext) {
        return this.#descriptor.execute(ctx);
    }
}
