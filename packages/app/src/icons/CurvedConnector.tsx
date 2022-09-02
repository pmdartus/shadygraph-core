import { SVGProps } from 'react';

export function CurvedConnector(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 15 15" {...props}>
            <path
                fill="currentColor"
                d="M1.5 0a1.5 1.5 0 1 0 1.415 2H4.5A2.5 2.5 0 0 1 7 4.5v6a3.5 3.5 0 0 0 3.5 3.5h1.585a1.5 1.5 0 1 0 0-1H10.5A2.5 2.5 0 0 1 8 10.5v-6A3.5 3.5 0 0 0 4.5 1H2.915A1.5 1.5 0 0 0 1.5 0Z"
            ></path>
        </svg>
    );
}
