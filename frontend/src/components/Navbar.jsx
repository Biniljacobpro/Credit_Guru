import { Menu, Bell } from "lucide-react";
export default function Navbar({ onMenu }) { return <header className="navbar"><button className="icon-btn menu-btn" onClick={onMenu}><Menu size={22}/></button><div><h1>Overview</h1><p>Manage your business finances</p></div><button className="icon-btn"><Bell size={20}/></button></header>; }
