import { descriptors as builtinsDescriptors } from './builtins/main';
import { descriptors as shaderDescriptors } from './shaders/main';

import type { NodeDescriptor, Registry } from './types';

const KNOWN_NODE_DESCRIPTORS = new Map<string, NodeDescriptor>(
    [...builtinsDescriptors, ...shaderDescriptors].map((descriptor) => [descriptor.id, descriptor]),
);

export class NodeRegistry implements Registry {
    #descriptors: Map<string, NodeDescriptor> = new Map(KNOWN_NODE_DESCRIPTORS);

    getNodeDescriptor(id: string): NodeDescriptor {
        const descriptor = this.#descriptors.get(id);
        if (!descriptor) {
            throw new Error(`Unknown node: ${id}`);
        }

        return descriptor;
    }
}
