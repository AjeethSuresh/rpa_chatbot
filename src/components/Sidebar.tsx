import React from 'react';
import {
  LayoutDashboard,
  Mail,
  BookOpen,
  BrainCircuit,
  Bot,
  CheckSquare,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  unprocessedEmailsCount: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  unprocessedEmailsCount,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Overview Dashboard', icon: LayoutDashboard },
    {
      id: 'emails' as TabType,
      label: 'Email Processing',
      icon: Mail,
      badge: unprocessedEmailsCount > 0 ? unprocessedEmailsCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    { id: 'knowledge' as TabType, label: 'Knowledge Base (RAG)', icon: BookOpen },
    { id: 'ai' as TabType, label: 'AI Processing Center', icon: BrainCircuit },
    { id: 'rpa' as TabType, label: 'UiPath Automation', icon: Bot },
    {
      id: 'approvals' as TabType,
      label: 'Approval Center',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    },
    { id: 'analytics' as TabType, label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings & Architecture', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto w-64 border-r border-slate-200 bg-white md:bg-slate-50/70 flex flex-col justify-between p-4 shrink-0 h-full md:h-[calc(100vh-4rem)] transition-transform duration-300 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enterprise Security Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide">Governance Guard</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          AI decision validation active. Actions exceeding $5,000 or modifying ERP records enforce human approval before UiPath execution.
        </p>
      </div>
    </aside>
    </>
  );
};
