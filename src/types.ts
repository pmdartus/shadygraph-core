export type Id = string;

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
    string: string;
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
export type StringValue = ValueMap['string'];

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
export type StringPropertyType = BasePropertyType<'string'>;

export type PropertyType =
    | BooleanPropertyType
    | Float1PropertyType
    | Float2PropertyType
    | Float3PropertyType
    | Float4PropertyType
    | Int1PropertyType
    | Int2PropertyType
    | Int3PropertyType
    | Int4PropertyType
    | StringPropertyType;

export type TextureType = 'color' | 'grayscale';

export interface IOType {
    label: string;
    type: TextureType;
}

export interface CompiledShader {
    render(
        properties: Record<string, Value>,
        attributes: Record<string, Value>,
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
    compileShader(descriptor: ShaderNodeDescriptor): Promise<CompiledShader>;
    createTexture(config: TextureConfig): Texture;
    copyImageToTexture(source: ImageBitmap, target: Texture): void;
    waitUntilDone(): Promise<void>;
}

export interface Registry {
    getNodeDescriptor(id: Id): NodeDescriptor;
}

export interface NodeReference {
    graph: Id;
    node: Id;
}

export interface EngineConfig {
    backend: Backend;
    registry?: Registry;
}

export interface Engine {
    backend: Backend;
    registry: Registry;
    createGraph(options: { label?: string; size?: number }): Graph;
    getGraph(id: Id): Graph;
    getGraphs(): Record<Id, Graph>;
    deleteGraph(id: Id): Graph;
    loadGraph(options: { data: SerializedGraph }): Graph;
    createNode(options: { graph: Id; descriptor: Id }): Node;
    getNode(options: NodeReference): Node;
    setNodeProperty(options: NodeReference & { name: string; value: Value }): Node;
    deleteNode(options: NodeReference): { node: Node; edges: Edge[] };
    createEdge(options: { graph: Id; from: Id; fromPort: Id; to: Id; toPort: Id }): Edge;
    deleteEdge(options: { graph: Id; edge: Id }): Edge;
    setActiveNode(options: NodeReference | null): Node | null;
    getActiveNode(): Node | null;
    renderGraph(graph: Graph): Promise<void>;
}

export interface NodeDescriptor {
    id: Id;
    label: string;
    properties: Record<string, PropertyType>;
    inputs: Record<string, IOType>;
    outputs: Record<string, IOType>;
    execute(ctx: ExecutionContext): Promise<void>;
}

export interface ShaderNodeDescriptor extends Omit<NodeDescriptor, 'execute'> {
    source: string;
}

export interface ExecutionContext {
    readonly graph: Graph;
    readonly backend: Backend;
    getProperty<T extends Value>(name: string): T;
    getProperties(): Record<string, Value>;
    getInput(name: string): Texture | null;
    getInputs(): Record<string, Texture | null>;
    getOutput(name: string): Texture;
    getOutputs(): Record<string, Texture>;
}

interface Serializable<T = any> {
    toJSON(): T;
}

export interface Graph extends Serializable<SerializedGraph> {
    readonly id: Id;
    label: string;
    size: number;
    addNode(node: Node): void;
    hasNode(id: Id): boolean;
    getNode(id: Id): Node;
    deleteNode(id: Id): Node;
    addEdge(edge: Edge): void;
    getEdge(id: Id): Edge;
    deleteEdge(id: Id): Edge;
    getIncomingEdges(node: Node): Edge[];
    getOutgoingEdges(node: Node): Edge[];
    iterNodes(): Iterable<Node>;
}

export interface SerializedGraph {
    id: Id;
    size: number;
    label: string;
    nodes: Record<Id, SerializedNode>;
    edges: Record<Id, SerializedEdge>;
}

export interface Node extends Serializable<SerializedNode> {
    readonly id: Id;
    readonly label: string;
    outputs: Record<string, Texture>;
    getInput(name: string): IOType | null;
    getInputs(): Record<string, IOType>;
    getOutput(name: string): IOType | null;
    getOutputs(): Record<string, IOType>;
    setProperty<T extends Value>(name: string, value: T): void;
    getProperty<T extends Value>(name: string): T;
    getProperties(): Record<string, Value>;
    execute(ctx: ExecutionContext): void | Promise<void>;
}

export interface SerializedNode {
    id: Id;
    descriptor: string;
    properties: Record<string, Value>;
}

export interface Edge extends Serializable<SerializedEdge> {
    readonly id: Id;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
}

export interface SerializedEdge {
    id: Id;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
}
