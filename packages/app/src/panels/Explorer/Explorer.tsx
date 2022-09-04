import { useState } from 'react';
import { clsx } from 'clsx';

interface GraphItem {
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
    const [items] = useState(defaultItems);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <ul role="listbox" tabIndex={0}>
            {items.map((item) => (
                <li
                    key={item.id}
                    role="option"
                    className={clsx(
                        'px-2 py-1 cursor-pointer hover:bg-slate-700',
                        item.id === selectedId && 'bg-slate-600',
                    )}
                    onClick={() => setSelectedId(item.id)}
                >
                    {item.label}
                </li>
            ))}
        </ul>
    );
}
