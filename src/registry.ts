import { descriptors as builtinsDescriptors } from './builtins/main';
import { descriptors as shaderDescriptors } from './shaders/main';

import type { Id, NodeDescriptor, Registry } from './types';

const KNOWN_NODE_DESCRIPTORS = new Map<string, NodeDescriptor>(
    [...builtinsDescriptors, ...shaderDescriptors].map((descriptor) => [descriptor.id, descriptor]),
);

export class NodeRegistry implements Registry {
    #descriptors: Map<Id, NodeDescriptor> = new Map(KNOWN_NODE_DESCRIPTORS);

    getNodeDescriptor(id: Id): NodeDescriptor {
        const descriptor = this.#descriptors.get(id);
        if (!descriptor) {
            throw new Error(`Unknown descriptor "${id}".`);
        }

        return descriptor;
    }
}
