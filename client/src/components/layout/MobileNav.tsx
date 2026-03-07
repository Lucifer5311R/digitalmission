import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';

const trainerLinks = [
  { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/trainer/classes', icon: BookOpen, label: 'Classes', end: false },
  { to: '/trainer/sessions', icon: Clock, label: 'Activity', end: false },
];

const supervisorLinks = [
  { to: '/supervisor', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/supervisor/trainers', icon: Users, label: 'Trainers', end: false },
  { to: '/supervisor/classes', icon: BookOpen, label: 'Classes', end: false },
  { to: '/supervisor/schedule', icon: Calendar, label: 'Schedule', end: false },
  { to: '/supervisor/reports', icon: FileText, label: 'Reports', end: false },
];

export function MobileNav() {
  const { user } = useAuth();
  const links = user?.role === UserRole.SUPERVISOR ? supervisorLinks : trainerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[56px] min-w-[44px] px-2 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="w-5 h-5 mb-0.5" />
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
