export default function StatusBadge({ status }) { return <span className={`status ${status}`}>{String(status||"").replace("_"," ")}</span>; }
