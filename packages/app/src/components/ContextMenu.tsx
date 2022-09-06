import { useEffect } from 'react';

export interface ContextMenuAction {
    id: string;
    label: string;
}

export interface ContextMenuProps<Action extends ContextMenuAction> {
    position?: { x: number; y: number };
    actions: Action[];
    onAction: (action: Action['id']) => void;
    onClose: () => void;
}

export function ContextMenu<Action extends ContextMenuAction>(props: ContextMenuProps<Action>) {
    const { position, actions, onAction, onClose } = props;

    useEffect(() => {
        const handleClick = () => {
            onClose();
        };

        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    });

    return (
        <div
            className="absolute w-64 bg-slate-900 flex flex-col shadow-md py-2.5"
            style={{
                left: position?.x,
                top: position?.y,
            }}
        >
            {actions.map((action) => (
                <ContextMenuItem key={action.id} action={action} onAction={onAction} />
            ))}
        </div>
    );
}

interface ContextMenuItemProps<Action extends ContextMenuAction> {
    action: Action;
    onAction: (action: Action['id']) => void;
}

function ContextMenuItem<Action extends ContextMenuAction>(props: ContextMenuItemProps<Action>) {
    const { action, onAction } = props;

    return (
        <button
            className="w-full px-2.5 py-0.5 text-left hover:bg-blue-600"
            onClick={() => onAction(action.id)}
        >
            {action.label}
        </button>
    );
}
