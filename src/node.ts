import { Graph, GraphContext } from './graph';
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
    #graph: Graph;

    /** @internal */
    constructor(config: NodeConfig, ctx: GraphContext) {
        this.id = config.id ?? uuid();
        this.descriptor = config.descriptor;
        this.properties = config.properties ?? {};

        if (config.outputs) {
            this.outputs = config.outputs;
        } else {
            this.outputs = Object.fromEntries(
                Object.entries(this.descriptor.outputs).map(([name, output]) => [
                    name,
                    ctx.engine.backend.createTexture({ type: output.type, size: ctx.graph.size }),
                ]),
            );
        }

        this.#graph = ctx.graph;
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

    getInput(name: string): Texture | null {
        if (!Object.hasOwn(this.descriptor.inputs, name)) {
            return null;
        }

        const incomingEdges = this.#graph.getIncomingEdges(this);
        const inputEdge = incomingEdges.find((edge) => edge.toPort === name);
        return inputEdge?.fromNode().getOutput(inputEdge.fromPort) ?? null;
    }

    getInputs(): Record<string, Texture | null> {
        return Object.fromEntries(
            Object.keys(this.descriptor.inputs).map((name) => {
                return [name, this.getInput(name)];
            }),
        );
    }

    getOutputs(): Record<string, Texture> {
        return { ...this.outputs };
    }

    getOutput(name: string): Texture | null {
        return Object.hasOwn(this.outputs, name) ? this.outputs[name] : null;
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
