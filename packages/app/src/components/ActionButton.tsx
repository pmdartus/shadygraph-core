import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

import './ActionButton.css';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
}

export const ActionButton: FC<PropsWithChildren<ActionButtonProps>> = (props) => {
    const { children, title, ...rest } = props;

    return (
        <button className="action-button" title={title} aria-label={title} {...rest}>
            {children}
        </button>
    );
};
