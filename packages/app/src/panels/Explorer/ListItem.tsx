import { useState, KeyboardEvent } from 'react';
import { clsx } from 'clsx';

import { ContextMenu } from '@/components/ContextMenu';

import { GraphItem } from './Explorer';

interface ListItemProps {
    item: GraphItem;
    selected?: boolean;
    onSelect?: () => void;
    onRename?: (name: string) => void;
    onDelete?: () => void;
}

enum GraphActionType {
    Rename = 'rename',
    Delete = 'delete',
}

const graphActions = [
    {
        id: GraphActionType.Rename,
        label: 'Rename',
    },
    {
        id: GraphActionType.Delete,
        label: 'Delete',
    },
];

export function ListItem({ item, selected, onSelect, onRename, onDelete }: ListItemProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    const handleKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
        evt.stopPropagation();

        if (evt.key === 'Enter') {
            setIsEditing(false);
            onRename?.(evt.currentTarget.value);
        } else if (evt.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleContextMenu = (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        evt.stopPropagation();

        setIsContextMenuVisible(true);
        setContextMenuPosition({ x: evt.pageX, y: evt.pageY });
    };

    const handleAction = (action: GraphActionType) => {
        switch (action) {
            case GraphActionType.Rename:
                setIsEditing(true);
                break;
            case GraphActionType.Delete:
                onDelete?.();
                break;
        }
    };

    return (
        <>
            <div
                className={clsx(
                    'px-2 py-1 cursor-pointer border border-transparent',
                    selected && 'bg-slate-600',
                    !selected && 'hover:border-blue-600',
                )}
                onClick={() => onSelect?.()}
                onDoubleClick={() => setIsEditing(true)}
                onContextMenu={handleContextMenu}
            >
                {isEditing ? (
                    <input
                        type="text"
                        className="bg-transparent"
                        autoFocus
                        defaultValue={item.label}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setIsEditing(false)}
                    />
                ) : (
                    item.label
                )}
            </div>
            {isContextMenuVisible && (
                <ContextMenu
                    position={contextMenuPosition}
                    actions={graphActions}
                    onClose={() => setIsContextMenuVisible(false)}
                    onAction={handleAction}
                />
            )}
        </>
    );
}
