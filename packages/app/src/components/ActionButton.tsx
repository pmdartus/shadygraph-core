import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
}

export const ActionButton: FC<PropsWithChildren<ActionButtonProps>> = (props) => {
    const { children, title, className, ...rest } = props;

    return (
        <button
            className={clsx(
                'text-lg p-1 mx-0.5 rounded-md bg-slate-800',
                'hover:bg-slate-700 active:bg-slate-600',
                className,
            )}
            title={title}
            aria-label={title}
            {...rest}
        >
            {children}
        </button>
    );
};
