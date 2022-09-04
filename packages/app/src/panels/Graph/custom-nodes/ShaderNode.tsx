import { Handle, NodeProps, Position } from 'react-flow-renderer';

interface NodeIO {
    id: string;
    label: string;
}

export interface NodeData {
    label: string;
    inputs: NodeIO[];
    outputs: NodeIO[];
}

export type ShaderNodeProps = NodeProps<NodeData>;

export function ShaderNode({ data }: NodeProps<NodeData>) {
    return (
        <div className="h-36 w-36 bg-black border-10 border-slate-700">
            {data.inputs.map((input, index) => {
                const step = 100 / data.inputs.length;
                const top = Math.round(index * step + step / 2);

                return (
                    <Handle
                        key={input.id}
                        id={input.id}
                        type="target"
                        position={Position.Left}
                        style={{ top: `${top}%` }}
                    />
                );
            })}

            <div>{data.label}</div>
            <div></div>

            {data.outputs.map((output, index) => {
                const step = 100 / data.outputs.length;
                const top = Math.round(index * step + step / 2);

                return (
                    <Handle
                        key={output.id}
                        id={output.id}
                        type="source"
                        position={Position.Right}
                        style={{ top: `${top}%` }}
                    />
                );
            })}
        </div>
    );
}
