import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ChevronUpDownIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../config/theme';

const DashboardNavigation = ({ roleDisplayName = 'Portal', logoIcon: LogoIcon = () => null, navItems = [], onLogout = () => {}, changePasswordPath = '#' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const items = Array.isArray(navItems) && navItems.length > 0 ? navItems : [
    { name: 'Home', path: '/', icon: null },
    { name: 'Listings', path: '/listings', icon: null },
    { name: 'Messages', path: '/messages', icon: null },
    { name: 'Profile', path: '/profile', icon: null },
  ];

  // Remove profile entries from sidebar; profile will live in the header dropdown
  const sidebarItems = items.filter((i) => {
    const name = (i.name || '').toLowerCase();
    const path = (i.path || '').toLowerCase();
    return !(name.includes('profile') || path.includes('/profile'));
  });

  const profileItem = items.find((i) => {
    const name = (i.name || '').toLowerCase();
    const path = (i.path || '').toLowerCase();
    return name.includes('profile') || path.includes('/profile');
  });

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 w-64 h-full bg-gradient-to-b from-indigo-900 via-indigo-800 to-violet-900 text-white p-4 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow" style={{ background: `linear-gradient(135deg, ${THEME.secondary.base}, ${THEME.primary.base})` }}>
                  <LogoIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">{roleDisplayName}</div>
                  <div className="text-xs text-indigo-200">Dashboard</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md bg-white/10">
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? THEME.tailwind.activeNav : 'hover:bg-white/10'}`}
                  >
                    <div className={`p-2 rounded ${active ? 'bg-white/20' : 'bg-white/10'}`}>{Icon && <Icon className="w-5 h-5" />}</div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* <div className="mt-6">
              <div className="p-3 rounded bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${THEME.secondary.base}, ${THEME.primary.base})` }}>{user?.name?.charAt(0) || 'U'}</div>
                  <div>
                    <div className="text-sm font-medium">{user?.name || 'User'}</div>
                    <div className="text-xs text-indigo-200">{roleDisplayName}</div>
                  </div>
                </div>
              </div>

              <button onClick={() => { setSidebarOpen(false); onLogout(); }} className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white">Logout</button>
            </div> */}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 sidebar-bg text-white fixed left-0 top-0 bottom-0" style={{ paddingTop: '64px' }}>
        {/* <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${THEME.secondary.base}, ${THEME.primary.base})` }}>
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold">{roleDisplayName}</div>
              <div className="text-xs text-indigo-200">Dashboard</div>
            </div>
          </div>
        </div> */}

        <nav className="flex-1 p-4 overflow-auto">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? THEME.tailwind.activeNav : 'hover:bg-white/10'}`}>
                  <div className={`p-2 rounded ${active ? 'bg-white/20' : 'bg-white/10'}`}>{Icon && <Icon className="w-5 h-5" />}</div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${THEME.secondary.base}, ${THEME.primary.base})` }}>{user?.name?.charAt(0) || 'U'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-indigo-200 truncate">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
          <button onClick={onLogout} className={`w-full mt-3 py-2 rounded-lg ${THEME.tailwind.buttonDanger}`}>Logout</button>
        </div> */}
      </aside>

      {/* Top Navigation (fixed) */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: `linear-gradient(90deg, ${THEME.primary.base}, ${THEME.secondary.base})` }} className="text-white shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center"><LogoIcon className="w-5 h-5 text-white" /></div>
              <div className="hidden lg:block font-bold">{roleDisplayName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.12)' }}>{user?.name?.charAt(0) || 'U'}</div>
              <span className="hidden sm:block text-sm font-medium">{user?.name || 'User'}</span>
              <ChevronUpDownIcon className="w-4 h-4" />
            </button>
            {userDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-black text-white rounded shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10 text-sm">
                    <div className="font-semibold">{user?.name || 'User'}</div>
                    <div className="text-xs truncate text-white/80">{user?.email || 'user@example.com'}</div>
                  </div>
                  {/* Profile link */}
                  {profileItem ? (
                    <Link to={profileItem.path} onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 hover:bg-white/5 text-sm">My Profile</Link>
                  ) : (
                    <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 hover:bg-white/5 text-sm">My Profile</Link>
                  )}
                  {/* Change Password link */}
                  <Link to={changePasswordPath} onClick={() => setUserDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-white/5 text-sm">
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Change Password
                  </Link>
                  <div className="border-t border-white/10 my-2"></div>
                  <button onClick={() => { setUserDropdownOpen(false); onLogout(); }} className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardNavigation;
