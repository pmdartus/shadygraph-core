import { assertValue, createValue } from './value';
import { uuid } from './utils/uuid';

import type {
    ExecutionContext,
    Id,
    IOType,
    Node,
    NodeDescriptor,
    PropertyType,
    SerializedNode,
    Texture,
    Value,
} from './types';

interface NodeConfig {
    id?: Id;
    descriptor: NodeDescriptor;
    properties?: Record<string, Value>;
    outputs?: Record<string, Texture>;
}

export class NodeImpl implements Node {
    readonly id: Id;
    #descriptor: NodeDescriptor;
    #properties: Record<string, Value>;
    outputs: Record<string, Texture>;
    isDirty = true;

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

    #getPropertyDescriptor(name: string): PropertyType {
        const { properties } = this.#descriptor;
        if (!Object.hasOwn(properties, name)) {
            throw new Error(`Property with name ${name} does not exist on ${this.#descriptor.id}.`);
        }

        return properties[name];
    }

    setProperty<T extends Value>(name: string, value: T): void {
        const propertyDescriptor = this.#getPropertyDescriptor(name);
        assertValue(value, propertyDescriptor.type);

        this.#properties[name] = value;
    }
    getProperty<T extends Value>(name: string): T {
        const propertyDescriptor = this.#getPropertyDescriptor(name);

        if (Object.hasOwn(this.#properties, name)) {
            return this.#properties[name] as T;
        } else {
            return createValue<T>(propertyDescriptor.type, propertyDescriptor.default);
        }
    }
    getProperties(): Record<string, Value> {
        return Object.fromEntries(
            Object.keys(this.#descriptor.properties).map((name) => [name, this.getProperty(name)!]),
        );
    }

    toJSON(): SerializedNode {
        return {
            id: this.id,
            descriptor: this.#descriptor.id,
            properties: this.#properties,
        };
    }

    execute(ctx: ExecutionContext) {
        return this.#descriptor.execute(ctx);
    }
}
