import { Boxes, LayoutDashboard, Package, Plus, Receipt } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: Receipt, end: false, exclude: '/orders/new' },
  { to: '/products', label: 'Products', icon: Package, end: false },
  { to: '/orders/new', label: 'New order', icon: Plus, end: true },
];

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Boxes size={16} strokeWidth={2} aria-hidden />
          </span>
          Stockroom
        </div>
        <nav className="nav" aria-label="Main">
          {links.map(({ to, label, icon: Icon, end, exclude }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive && pathname !== exclude ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
