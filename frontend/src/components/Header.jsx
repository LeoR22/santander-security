import { Search, Bell, Moon, Maximize2, Settings } from 'lucide-react';
import './Header.css';

export function Header({ 
  currentSection = '',
  searchPlaceholder = 'Buscar incidentes, ubicaciones...',
  notificationCount = 3 
}) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="current-section">{currentSection}</h1>
      </div>

      <div className="header-center">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn" title="Modo oscuro">
          <Moon size={20} />
        </button>
        <button className="icon-btn" title="Notificaciones">
          <div className="notification-wrapper">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
        </button>
        <button className="icon-btn" title="Pantalla completa">
          <Maximize2 size={20} />
        </button>
        <button className="icon-btn" title="Configuración">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}