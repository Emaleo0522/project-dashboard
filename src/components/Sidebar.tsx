'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import ThemeToggle from './ThemeToggle'
import {
  Home,
  FolderOpen,
  Shield,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  projectName?: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

export default function Sidebar({ currentSection, onSectionChange, projectName }: SidebarProps) {
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      description: 'Vista general de proyectos'
    },
    {
      id: 'details',
      label: 'Detalles',
      icon: <FolderOpen className="w-5 h-5" />,
      description: 'Información del proyecto'
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: <ImageIcon className="w-5 h-5" />,
      description: 'Gestión de imágenes'
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: <Shield className="w-5 h-5" />,
      description: 'Credenciales cifradas'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      description: 'Ajustes del proyecto'
    }
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Dev Panel</h2>
              {projectName && (
                <p className="text-sm text-muted-foreground truncate">{projectName}</p>
              )}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-muted rounded-lg transition-colors lg:block hidden"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id)
              setIsMobileOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
              currentSection === item.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-foreground'
            }`}
            title={isCollapsed ? item.label : item.description}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs opacity-75 truncate ${
                  currentSection === item.id ? '' : 'text-muted-foreground'
                }`}>
                  {item.description}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* User & Controls */}
      <div className="p-4 border-t border-border space-y-3">
        {/* User Info */}
        <div className={`flex items-center gap-3 p-2 rounded-lg bg-muted/50 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="flex-1">
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Cerrar sesión' : ''}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </div>
    </>
  )
}