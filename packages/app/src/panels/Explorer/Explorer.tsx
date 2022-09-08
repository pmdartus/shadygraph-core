import { useState, KeyboardEvent } from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ContextMenu';
import { Toolbar, ToolbarButton } from '@/components/Toolbar';

import { ListItem } from './ListItem';

export interface GraphItem {
    id: string;
    label: string;
}

const defaultItems: GraphItem[] = [
    {
        id: '1',
        label: 'Paint Stroke',
    },
    {
        id: '2',
        label: 'Tile Pattern',
    },
    {
        id: '3',
        label: 'Foliage',
    },
];

function findNextAvailableLabel(items: GraphItem[], name: string): string {
    let count = 1;
    let newName = name;

    while (items.find((item) => item.label === newName)) {
        newName = `${name} ${count}`;
        count++;
    }

    return newName;
}

export function Explorer() {
    const [items, setItems] = useState(defaultItems);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleKeyDown = (evt: KeyboardEvent<HTMLUListElement>) => {
        if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
            if (evt.currentTarget === evt.target && items.length) {
                // Handle focus on the list
                const nextIndex = evt.key === 'ArrowDown' ? 0 : items.length - 1;
                const nextId = items[nextIndex]?.id;

                if (nextId) {
                    const target = evt.currentTarget.querySelector(
                        `[data-graph-id="${nextId}"]`,
                    ) as HTMLUListElement;
                    target.focus();
                }
            } else {
                // Handle focus on a list item
                const currentId = (evt.target as HTMLUListElement)?.dataset.graphId;
                if (!currentId) {
                    return;
                }

                const currentIndex = items.findIndex((item) => item.id === currentId);

                const nextIndexCandidate =
                    evt.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;

                const nextIndex = Math.min(Math.max(nextIndexCandidate, 0), items.length - 1);
                const nextId = items[nextIndex].id;

                const target = evt.currentTarget.querySelector(
                    `[data-graph-id="${nextId}"]`,
                ) as HTMLUListElement;
                target.focus();
            }
        }
    };

    const handleCreate = () => {
        setItems((items) => {
            const label = findNextAvailableLabel(items, 'Untitled graph');

            return [
                ...items,
                {
                    id: `${items.length + 1}`,
                    label,
                },
            ];
        });
    };

    const handleRename = (id: string, name: string) => {
        setItems(
            items.map((item) => {
                return item.id === id
                    ? {
                          ...item,
                          label: name,
                      }
                    : item;
            }),
        );
    };

    const handleDuplicate = (id: string) => {
        setItems((items) => {
            const item = items.find((item) => item.id === id);
            if (!item) {
                return items;
            }

            const label = findNextAvailableLabel(items, `${item.label} copy`);

            return [
                ...items,
                {
                    id: `${items.length + 1}`,
                    label,
                },
            ];
        });
    };

    const handleDelete = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleSave = () => {
        console.log('save!');
    };

    return (
        <>
            <Toolbar>
                <ToolbarButton onClick={handleCreate}>Create</ToolbarButton>
                <ToolbarButton onClick={handleSave}>Save</ToolbarButton>
            </Toolbar>
            <ContextMenu>
                <ContextMenuTrigger className="h-96 block">
                    <ul role="listbox" tabIndex={0} onKeyDown={handleKeyDown}>
                        {items.map((item) => (
                            <li key={item.id} role="option" tabIndex={-1} data-graph-id={item.id}>
                                <ListItem
                                    key={item.id}
                                    item={item}
                                    selected={item.id === selectedId}
                                    onSelect={() => setSelectedId(item.id)}
                                    onRename={(name) => handleRename(item.id, name)}
                                    onDuplicate={() => handleDuplicate(item.id)}
                                    onDelete={() => handleDelete(item.id)}
                                />
                            </li>
                        ))}
                    </ul>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onSelect={handleCreate}>Create graph</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
}
