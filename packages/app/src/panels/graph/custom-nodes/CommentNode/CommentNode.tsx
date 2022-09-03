import { NodeProps } from 'react-flow-renderer';

import './CommentNode.css';

export interface CommentNodeData {
    message: string;
}

export type CommentNodeProps = NodeProps<CommentNodeData>;

export function CommentNode({ data }: CommentNodeProps) {
    return (
        <>
            <p className="comment-node__message">{data.message}</p>
        </>
    );
}
