import { useState } from 'react';
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

export function Explorer() {
    const [items, setItems] = useState(defaultItems);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    return (
        <ul role="listbox" tabIndex={0}>
            {items.map((item) => (
                <li key={item.id} role="option">
                    <ListItem
                        key={item.id}
                        item={item}
                        selected={item.id === selectedId}
                        onSelect={() => setSelectedId(item.id)}
                        onRename={(name) => handleRename(item.id, name)}
                    />
                </li>
            ))}
        </ul>
    );
}
