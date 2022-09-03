import { NodeProps } from 'react-flow-renderer';

export interface CommentNodeData {
    message: string;
}

export type CommentNodeProps = NodeProps<CommentNodeData>;

export function CommentNode({ data }: CommentNodeProps) {
    return <p className="whitespace-pre-line">{data.message}</p>;
}
