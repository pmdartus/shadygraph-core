import { FC, PropsWithChildren } from 'react';

import { ActionButton, ActionButtonProps } from './ActionButton';

export interface ActionToggleButtonProps extends Omit<ActionButtonProps, 'onClick'> {
    pressed: boolean;
    onPress: (pressed: boolean) => void;
}

export const ActionToggleButton: FC<PropsWithChildren<ActionToggleButtonProps>> = (props) => {
    const { pressed, onPress, children, ...rest } = props;

    return (
        <ActionButton aria-pressed={pressed} onClick={() => onPress(!pressed)} {...rest}>
            {children}
        </ActionButton>
    );
};
