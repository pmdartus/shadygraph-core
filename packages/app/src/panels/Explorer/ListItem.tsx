import { useState, KeyboardEvent, useRef, useLayoutEffect } from 'react';
import { clsx } from 'clsx';

import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from '@/components/ContextMenu';

import { GraphItem } from './Explorer';

interface ListItemProps {
    item: GraphItem;
    selected: boolean;
    onSelect(): void;
    onRename(name: string): void;
    onDuplicate(): void;
    onDelete(): void;
}

enum GraphActionType {
    Rename = 'rename',
    Duplicate = 'duplicate',
    Delete = 'delete',
}

const graphActions = [
    {
        id: GraphActionType.Rename,
        label: 'Rename',
    },
    {
        id: GraphActionType.Duplicate,
        label: 'Duplicate',
    },
    {
        id: GraphActionType.Delete,
        label: 'Delete',
    },
];

export function ListItem({
    item,
    selected,
    onSelect,
    onRename,
    onDuplicate,
    onDelete,
}: ListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
        evt.stopPropagation();

        if (evt.key === 'Enter') {
            setIsEditing(false);
            onRename?.(evt.currentTarget.value);
        } else if (evt.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleInputBlur = () => {
        setIsEditing(false);
    };

    const handleAction = (action: GraphActionType) => {
        switch (action) {
            case GraphActionType.Rename:
                setIsEditing(true);
                break;
            case GraphActionType.Duplicate:
                onDuplicate?.();
                break;
            case GraphActionType.Delete:
                onDelete?.();
                break;
        }
    };

    useLayoutEffect(() => {
        if (isEditing) {
            // Hack: Adding a timeout to ensure that the input keeps the focus.
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isEditing]);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    className={clsx(
                        'px-2 py-1 cursor-pointer border-2 border-transparent hover:border-blue-600',
                        selected && 'bg-blue-800',
                    )}
                    onClick={() => onSelect?.()}
                    onDoubleClick={() => setIsEditing(true)}
                >
                    {isEditing ? (
                        <input
                            type="text"
                            className="bg-slate-800"
                            ref={inputRef}
                            defaultValue={item.label}
                            onKeyDown={handleInputKeyDown}
                            onBlur={handleInputBlur}
                        />
                    ) : (
                        item.label
                    )}
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                {graphActions.map((action) => (
                    <ContextMenuItem key={action.id} onSelect={() => handleAction(action.id)}>
                        {action.label}
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    );
}
