import { SVGProps } from 'react';

export default function Magnet(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="M3 7v6a9 9 0 0 0 9 9a9 9 0 0 0 9-9V7h-4v6a5 5 0 0 1-5 5a5 5 0 0 1-5-5V7m10-2h4V2h-4M3 5h4V2H3"
            ></path>
        </svg>
    );
}
