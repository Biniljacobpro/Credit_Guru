import { NavLink } from "react-router-dom";
import { Users, Receipt } from "lucide-react";
const links = [["Customers", "/customers", Users], ["Invoices", "/invoices", Receipt]];
export default function Sidebar({ open, onClose }) { return <aside className={`sidebar ${open?"open":""}`}><div className="brand"><span className="brand-mark">C</span><span>Credit<span>Guru</span></span></div><nav>{links.map(([label,to,Icon])=><NavLink key={to} to={to} onClick={onClose} className={({isActive})=>isActive?"active":""}><Icon size={19}/>{label}</NavLink>)}</nav></aside>; }
