import { SVGProps } from 'react';

export function PerspectiveSelectedFace(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
                <path
                    strokeLinecap="round"
                    d="M21 7.353v9.294a.6.6 0 0 1-.309.525l-8.4 4.666a.6.6 0 0 1-.582 0l-8.4-4.666A.6.6 0 0 1 3 16.647V7.353a.6.6 0 0 1 .309-.524l8.4-4.667a.6.6 0 0 1 .582 0l8.4 4.667a.6.6 0 0 1 .309.524Z"
                ></path>
                <path
                    strokeLinecap="round"
                    d="m3.528 7.294l8.18 4.544a.6.6 0 0 0 .583 0l8.209-4.56M12 21v-9"
                ></path>
                <path
                    fill="currentColor"
                    d="m11.691 11.829l-7.8-4.334A.6.6 0 0 0 3 8.02v8.627a.6.6 0 0 0 .309.525l7.8 4.333A.6.6 0 0 0 12 20.98v-8.627a.6.6 0 0 0-.309-.524Z"
                ></path>
            </g>
        </svg>
    );
}
