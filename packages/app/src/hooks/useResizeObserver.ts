import { RefCallback, useCallback, useRef, useState } from 'react';

interface Size {
    width: number | undefined;
    height: number | undefined;
}

export function useResizeObserver(): Size & {
    ref: RefCallback<Element>;
} {
    const [size, setSize] = useState<Size>({
        width: undefined,
        height: undefined,
    });

    const resizeObserverRef = useRef<ResizeObserver>();

    const refCallback: RefCallback<Element> = useCallback((element) => {
        if (!element) {
            return;
        }

        if (!resizeObserverRef.current) {
            resizeObserverRef.current = new ResizeObserver((entries) => {
                const entry = entries[entries.length - 1];
                const { width, height } = entry.contentRect;

                setSize({
                    width,
                    height,
                });
            });
        }

        resizeObserverRef.current.observe(element);
    }, []);

    return {
        width: size.width,
        height: size.height,
        ref: refCallback,
    };
}
