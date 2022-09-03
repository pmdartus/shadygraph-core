import { SVGProps } from 'react';

export default function ResetZoom(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="M17 22v-2h3v-3h2v3.5c0 .39-.16.74-.46 1.04c-.3.3-.65.46-1.04.46H17M7 22H3.5c-.39 0-.74-.16-1.04-.46c-.3-.3-.46-.65-.46-1.04V17h2v3h3v2M17 2h3.5c.39 0 .74.16 1.04.46c.3.3.46.65.46 1.04V7h-2V4h-3V2M7 2v2H4v3H2V3.5c0-.39.16-.74.46-1.04c.3-.3.65-.46 1.04-.46H7m3.5 4C13 6 15 8 15 10.5c0 .88-.25 1.7-.69 2.4l3.26 3.26l-1.41 1.41l-3.26-3.26c-.7.44-1.52.69-2.4.69C8 15 6 13 6 10.5S8 6 10.5 6m0 2a2.5 2.5 0 0 0 0 5a2.5 2.5 0 0 0 0-5Z"
            ></path>
        </svg>
    );
}
