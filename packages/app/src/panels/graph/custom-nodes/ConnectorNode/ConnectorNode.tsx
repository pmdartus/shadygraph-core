import { Handle, Position } from 'react-flow-renderer';

import './ConnectorNode.css';

export function ConnectorNode() {
    return (
        <>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </>
    );
}
