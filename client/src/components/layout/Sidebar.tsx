import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Clock,
  X,
  AlertTriangle,
  ScrollText,
  UserCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const trainerLinks = [
  { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/trainer/classes', icon: BookOpen, label: 'My Classes', end: false },
  { to: '/trainer/sessions', icon: Clock, label: 'Sessions', end: false },
  { to: '/trainer/profile', icon: UserCircle, label: 'Profile', end: false },
];

const supervisorLinks = [
  { to: '/supervisor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/supervisor/trainers', icon: Users, label: 'Trainers', end: false },
  { to: '/supervisor/classes', icon: BookOpen, label: 'Classes', end: false },
  { to: '/supervisor/schedule', icon: Calendar, label: 'Schedule', end: false },
  { to: '/supervisor/reports', icon: FileText, label: 'Reports', end: false },
  { to: '/supervisor/attendance-alerts', icon: AlertTriangle, label: 'Attendance Alerts', end: false },
  { to: '/supervisor/audit-log', icon: ScrollText, label: 'Audit Log', end: false },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const links = user?.role === UserRole.SUPERVISOR ? supervisorLinks : trainerLinks;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-bold text-primary-600">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navLinkClass}
              onClick={onClose}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
