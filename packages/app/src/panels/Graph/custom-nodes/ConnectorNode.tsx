import { Handle, HandleProps, Position } from 'react-flow-renderer';

function ConnectorNodeHandle(props: HandleProps) {
    return <Handle {...props} />;
}

export function ConnectorNode() {
    return (
        <div className="w-5 h-5 rounded-md bg-slate-200 border-2 border-slate-400">
            <ConnectorNodeHandle type="target" position={Position.Left} />
            <ConnectorNodeHandle type="source" position={Position.Right} />
        </div>
    );
}
