import { SVGProps } from 'react';

export function TreeOutline(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="M15 21v-3h-4V8H9v3H2V3h7v3h6V3h7v8h-7V8h-2v8h2v-3h7v8ZM4 5v4Zm13 10v4Zm0-10v4Zm0 4h3V5h-3Zm0 10h3v-4h-3ZM4 9h3V5H4Z"
            ></path>
        </svg>
    );
}
