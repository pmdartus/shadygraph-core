import { createValue } from './value';

import { uuid } from './utils/uuid';

import type { ExecutionContext, Node, NodeDescriptor, Texture, Value } from './types';

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

export abstract class AbstractBaseNode implements Node {
    id: string;
    descriptor: NodeDescriptor;
    properties: Record<string, Value>;
    outputs: Record<string, Texture>;

    /** @internal */
    constructor(config: NodeConfig) {
        this.id = config.id ?? uuid();
        this.descriptor = config.descriptor;
        this.properties = config.properties ?? {};
        this.outputs = config.outputs ?? {};
    }

    getProperties(): Record<string, Value> {
        return Object.fromEntries(
            Object.keys(this.descriptor.properties).map((name) => [name, this.getProperty(name)!]),
        );
    }

    getProperty<T extends Value>(name: string): T | null {
        if (!Object.hasOwn(this.descriptor.properties, name)) {
            return null;
        }

        if (Object.hasOwn(this.properties, name)) {
            return this.properties[name] as T;
        } else {
            const propertyDescriptor = this.descriptor.properties[name];
            return createValue<T>(propertyDescriptor.type, propertyDescriptor.default);
        }
    }

    toJSON(): BaseSerializedNode {
        return {
            id: this.id,
            properties: this.properties,
        };
    }

    async execute(_ctx: ExecutionContext) {
        throw new Error('Not implemented');
    }
}
