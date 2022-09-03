import { SVGProps } from 'react';

export default function ElbowConnector(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 15 15" {...props}>
            <path
                fill="currentColor"
                d="M1.5 0a1.5 1.5 0 1 0 1.415 2H7v12h5.085a1.5 1.5 0 1 0 0-1H8V1H2.915A1.5 1.5 0 0 0 1.5 0Z"
            ></path>
        </svg>
    );
}
