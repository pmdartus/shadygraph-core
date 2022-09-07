import clsx from 'clsx';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

export const ContextMenuContent = (props: ContextMenuPrimitive.ContextMenuContentProps) => {
    const { className, ...contentProps } = props;

    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content
                className={clsx(
                    'w-52 p-2 rounded-sm overflow-hidden bg-slate-900 shadow-md z-50',
                    className,
                )}
                {...contentProps}
            />
        </ContextMenuPrimitive.Portal>
    );
};

export const ContextMenuItem = (props: ContextMenuPrimitive.ContextMenuItemProps) => {
    const { className, ...itemProps } = props;

    return (
        <ContextMenuPrimitive.Item
            className={clsx(
                'px-2 py-1 rounded-sm select-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-600',
                'radix-highlighted:bg-blue-800 radix-highlighted:text-white',
                className,
            )}
            {...itemProps}
        />
    );
};
