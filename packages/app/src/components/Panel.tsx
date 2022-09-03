export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full rounded-xl bg-slate-800">
            <div className="pt-2 px-3 border-slate-500">
                <div className="font-semibold">{title}</div>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}
