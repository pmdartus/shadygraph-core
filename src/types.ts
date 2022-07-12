import { Node, NodeConfig } from './node';
import { Edge, EdgeConfig } from './edge';
import { Graph, GraphConfig, SerializedGraph } from './graph';

type ValueTypeMap = {
    boolean: boolean;
    float1: [number];
    float2: [number, number];
    float3: [number, number, number];
    float4: [number, number, number, number];
    int1: [number];
    int2: [number, number];
    int3: [number, number, number];
    int4: [number, number, number, number];
};

export type ValueMap = {
    [T in keyof ValueTypeMap]: {
        type: T;
        value: ValueTypeMap[T];
    };
};

export type BooleanValue = ValueMap['boolean'];
export type Float1Value = ValueMap['float1'];
export type Float2Value = ValueMap['float2'];
export type Float3Value = ValueMap['float3'];
export type Float4Value = ValueMap['float4'];
export type Int1Value = ValueMap['int1'];
export type Int2Value = ValueMap['int2'];
export type Int3Value = ValueMap['int3'];
export type Int4Value = ValueMap['int4'];

export type Value = ValueMap[keyof ValueMap];
export type ValueType = Value['type'];

interface BasePropertyType<T extends ValueType> {
    label: string;
    type: T;
    description: string;
    default: ValueTypeMap[T];
}

export type BooleanPropertyType = BasePropertyType<'boolean'>;
export type Float1PropertyType = BasePropertyType<'float1'>;
export type Float2PropertyType = BasePropertyType<'float2'>;
export type Float3PropertyType = BasePropertyType<'float3'>;
export type Float4PropertyType = BasePropertyType<'float4'>;
export type Int1PropertyType = BasePropertyType<'int1'>;
export type Int2PropertyType = BasePropertyType<'int2'>;
export type Int3PropertyType = BasePropertyType<'int3'>;
export type Int4PropertyType = BasePropertyType<'int4'>;

export type PropertyType =
    | BooleanPropertyType
    | Float1PropertyType
    | Float2PropertyType
    | Float3PropertyType
    | Float4PropertyType
    | Int1PropertyType
    | Int2PropertyType
    | Int3PropertyType
    | Int4PropertyType;

export type TextureType = 'color' | 'grayscale';

export interface ShaderIOType {
    label: string;
    type: TextureType;
}

export interface ShaderDescriptor {
    id: string;
    label: string;
    source: string;
    properties: Record<string, PropertyType>;
    inputs: Record<string, ShaderIOType>;
    outputs: Record<string, ShaderIOType>;
}

export interface CompilerShader {
    render(
        properties: Record<string, Value>,
        inputs: Record<string, Texture | null>,
        outputs: Record<string, Texture>,
    ): void;
    destroy(): void;
}

export interface TextureConfig {
    label?: string;
    type: TextureType;
    size: number;
}

export interface Texture {
    readonly type: TextureType;
    readonly size: number;
    getData(): Promise<ArrayBuffer>;
}

export interface Backend {
    compileShader(descriptor: ShaderDescriptor): Promise<CompilerShader>;
    createTexture(config: TextureConfig): Texture;
    waitUntilDone(): Promise<void>;
}

export interface EngineConfig {
    backend: Backend;
    shaders?: ShaderDescriptor[];
}

export interface Engine {
    backend: Backend;
    registerShader(descriptor: ShaderDescriptor): void;
    getShaderDescriptor(id: string): ShaderDescriptor | undefined;
    createGraph(config: GraphConfig): Graph;
    loadGraph(serializedGraph: SerializedGraph): Graph;
    renderGraph(graph: Graph): Promise<void>;
}
