import { SVGProps } from 'react';

export function TransitConnection(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="M15 12c0-1.3-.84-2.4-2-2.82V6.82C14.16 6.4 15 5.3 15 4a3 3 0 0 0-3-3a3 3 0 0 0-3 3c0 1.3.84 2.4 2 2.82v2.37C9.84 9.6 9 10.7 9 12s.84 2.4 2 2.82v2.36C9.84 17.6 9 18.7 9 20a3 3 0 0 0 3 3a3 3 0 0 0 3-3c0-1.3-.84-2.4-2-2.82v-2.36c1.16-.42 2-1.52 2-2.82m-3-9a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m0 18a1 1 0 0 1-1-1a1 1 0 0 1 1-1a1 1 0 0 1 1 1a1 1 0 0 1-1 1Z"
            ></path>
        </svg>
    );
}