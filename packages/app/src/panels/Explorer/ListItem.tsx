import { useState, KeyboardEvent } from 'react';
import { clsx } from 'clsx';

import { GraphItem } from './Explorer';

interface ListItemProps {
    item: GraphItem;
    selected?: boolean;
    onSelect?: () => void;
    onRename?: (name: string) => void;
}

export function ListItem({ item, selected, onSelect, onRename }: ListItemProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            setIsEditing(false);
            onRename?.(event.currentTarget.value);
        } else if (event.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <div
            className={clsx(
                'px-2 py-1 cursor-pointer border border-transparent',
                selected && 'bg-slate-600',
                !selected && 'hover:border-blue-600',
            )}
            onClick={() => onSelect?.()}
            onDoubleClick={() => setIsEditing(true)}
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
    );
}
