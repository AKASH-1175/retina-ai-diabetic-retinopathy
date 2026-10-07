import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
const LINKS = [['/', 'Home'], ['/analyze', 'Analyze'], ['/about', 'Methodology'], ['/about#about', 'About']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  return (
    <header className="nav">
      <div className="wrap navrow">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="logo" aria-hidden="true" />
          <span><strong>RetinaAI</strong><small>Multimodal Retinal Intelligence</small></span>
        </Link>
        <nav className={'links' + (open ? ' open' : '')} aria-label="Main">
          {LINKS.map(([to, l]) => (
            <NavLink key={l} to={to} end onClick={() => setOpen(false)}>{l}</NavLink>
          ))}
        </nav>
        <button className="btn primary navcta" onClick={() => nav('/analyze')}>Start Analysis</button>
        <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
