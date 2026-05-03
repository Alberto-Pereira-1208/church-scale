import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Home, Calendar, BarChart3, Plus, Users, Church, Settings, Bell, Sliders, CheckSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Itens principais (para bottom nav em mobile)
  const mainMenuItems = [
    { id: 'home', label: 'Início', href: '/', icon: Home },
    { id: 'escalas', label: 'Escalas', href: '/escalas', icon: Calendar },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { id: 'nova-escala', label: 'Nova', href: '/escalas/nova', icon: Plus },
  ];

  // Itens secundários (para drawer/menu lateral)
  const secondaryMenuItems = [
    { id: 'historico-presenca', label: 'Histórico de Presença', href: '/historico-presenca', icon: CheckSquare },
    { id: 'analise-presenca', label: 'Análise de Presença', href: '/analise-presenca', icon: BarChart3 },
    { id: 'historico-exclusoes', label: 'Histórico de Exclusões', href: '/historico-exclusoes', icon: Trash2 },
    { id: 'voluntarios', label: 'Voluntários', href: '/voluntarios', icon: Users },
    { id: 'ministerios', label: 'Ministérios', href: '/ministerios', icon: Church },
    { id: 'configuracoes', label: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const notificacaoItems = [
    { id: 'historico', label: 'Histórico', href: '/historico-notificacoes', icon: Bell },
    { id: 'customizar', label: 'Customizar', href: '/customizar-notificacoes', icon: Sliders },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-accent">⛪ Church Scale</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Gerenciador de Escalas</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors duration-150 min-w-0',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Divisor */}
          <div className="my-4 border-t border-sidebar-border"></div>
          
          {/* Menu Secundário */}
          <p className="text-xs font-semibold text-sidebar-foreground/60 px-4 py-2 uppercase">Menu</p>
          {secondaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors duration-150 min-w-0',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Divisor */}
          <div className="my-4 border-t border-sidebar-border"></div>
          
          {/* Notificacoes */}
          <p className="text-xs font-semibold text-sidebar-foreground/60 px-4 py-2 uppercase">Notificacoes</p>
          {notificacaoItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors duration-150 min-w-0',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60 text-center">
          <p>Funciona 100% offline</p>
          <p>Seus dados estão seguros</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar border-b border-sidebar-border flex items-center justify-between p-4 sticky top-0 z-40">
        <h1 className="text-lg font-bold text-sidebar-accent">⛪ Church Scale</h1>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="p-2 hover:bg-sidebar-accent/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu - Overlay */}
      {menuAberto && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <nav
        className={cn(
          'md:hidden fixed left-0 top-16 bottom-20 w-64 bg-sidebar border-r border-sidebar-border p-4 space-y-2 z-40 overflow-y-auto transition-transform duration-300 ease-in-out',
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Menu Secundário */}
        <p className="text-xs font-semibold text-sidebar-foreground/60 px-4 py-2 uppercase">Menu</p>
        {secondaryMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-start gap-4 px-4 py-3 rounded-lg transition-colors duration-150 min-w-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              )}
              onClick={() => setMenuAberto(false)}
            >
              <Icon size={22} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Divisor */}
        <div className="my-2 border-t border-sidebar-border"></div>
        
        {/* Notificacoes */}
        <p className="text-xs font-semibold text-sidebar-foreground/60 px-4 py-2 uppercase">Notificacoes</p>
        {notificacaoItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-start gap-4 px-4 py-3 rounded-lg transition-colors duration-150 min-w-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              )}
              onClick={() => setMenuAberto(false)}
            >
              <Icon size={22} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content - Com padding bottom para mobile */}
      <main className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border flex items-center justify-around z-40">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-3 px-4 flex-1 transition-colors duration-150',
                isActive
                  ? 'text-sidebar-accent'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
              )}
            >
              <Icon size={24} className="flex-shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
