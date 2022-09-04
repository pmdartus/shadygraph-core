import { FC, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

import { ActionButton, ActionButtonProps } from './ActionButton';

export interface ActionToggleButtonProps extends Omit<ActionButtonProps, 'onClick'> {
    pressed: boolean;
    onPress: (pressed: boolean) => void;
}

export const ActionToggleButton: FC<PropsWithChildren<ActionToggleButtonProps>> = (props) => {
    const { pressed, onPress, children, className, ...rest } = props;

    return (
        <ActionButton
            className={clsx(pressed && 'bg-slate-600', className)}
            aria-pressed={pressed}
            onClick={() => onPress(!pressed)}
            {...rest}
        >
            {children}
        </ActionButton>
    );
};
