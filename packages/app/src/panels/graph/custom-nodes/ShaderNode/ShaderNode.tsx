import { Handle, NodeProps, Position } from 'react-flow-renderer';

import './ShaderNode.css';

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
        <>
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

            <div className="shader-node__label">{data.label}</div>
            <div className="shader-node__preview"></div>

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
        </>
    );
}
