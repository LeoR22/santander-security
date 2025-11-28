import { Home, Map, TrendingDown, FileText, MessageSquare, Bell, Users, Settings,LogOut, ChevronLeft } from 'lucide-react';
import './Sidebar.css';





const navItems = [
   { label: 'Dashboard', id: 'dashboard' },
  { label: 'Mapa Interactivo', id: 'map' },
  { label: 'Análisis', id: 'analysis' },
  { label: 'Chat', id: 'chat' },
  { label: 'Incidentes', id: 'alerts' }
];


// Función para obtener el icono según el ID
function getIcon(id) {
  const iconMap = {
    dashboard: <Home size={20} />,
    map: <Map size={20} />,
    analysis: <TrendingDown size={20} />,
    chat: <MessageSquare size={20} />,
    alerts: <FileText size={20} />,
    users: <Users size={20} />,
    settings: <Settings size={20} />,
  };
  return iconMap[id] || null;
}

export function Sidebar({ activeItem, onNavigate }) {
  return (
    <aside className="sidebar">
  {/* Header */}
  <div className="sidebar-header">
    <div className="logo">
      <img 
      alt="Vigi360 Logo"
      className="logo-image"
      src="/Vigi.png"
/>
    </div>
  </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="avatar">P</div>
        <div className="user-info">
          <p className="user-name">Policia Nacional</p>
          <p className="user-role">Administrador</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {getIcon(item.id)}
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn">
          <span></span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
