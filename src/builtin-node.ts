import { GraphContext } from './graph';
import { AbstractBaseNode, BaseSerializedNode, NodeConfig } from './node';

import type { NodeDescriptor } from './types';

export enum BuiltInNodeType {
    Input = 'input',
    Output = 'output',
    Bitmap = 'bitmap',
    SVG = 'svg',
}

export interface BuiltinNodeConfig extends NodeConfig {
    nodeType: BuiltInNodeType;
}

export interface BuiltinSerializedNode extends BaseSerializedNode {
    type: 'builtin';
    nodeType: BuiltInNodeType;
}

export abstract class AbstractBuiltinNode extends AbstractBaseNode {
    type = 'builtin' as const;
    nodeType: BuiltInNodeType;

    constructor(config: BuiltinNodeConfig, ctx: GraphContext) {
        super(config, ctx);
        this.nodeType = config.nodeType;
    }

    toString() {
        return `BuiltinNode [id: ${this.id}, type: ${this.nodeType}]`;
    }

    toJSON(): BuiltinSerializedNode {
        return {
            ...this.toJSON(),
            type: this.type,
            nodeType: this.nodeType,
        };
    }

    static get descriptor(): NodeDescriptor {
        throw new Error('Not implemented');
    }

    static create(
        config: Omit<BuiltinNodeConfig, 'descriptor'>,
        ctx: GraphContext,
    ): AbstractBuiltinNode {
        const descriptor = this.descriptor;

        // TODO: Find a better way to instantiate built-in classes.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        return new this({ ...config, descriptor }, ctx);
    }
}
