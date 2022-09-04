import { FC, PropsWithChildren, ReactNode } from 'react';

export const Panel: FC<PropsWithChildren<{ title: string; icon: ReactNode }>> = ({
    title,
    icon,
    children,
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-800 rounded-md">
            <div className="py-1 px-2 flex items-center gap-1 rounded-t-md border-b bg-slate-700 border-slate-600">
                {icon}
                <div className="font-semibold">{title}</div>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
};
