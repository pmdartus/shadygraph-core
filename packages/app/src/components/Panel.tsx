import './Panel.css';

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-title">{title}</div>
            </div>
            <div className="panel-body">{children}</div>
        </div>
    );
}
