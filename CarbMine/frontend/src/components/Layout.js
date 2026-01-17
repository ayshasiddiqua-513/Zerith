import React, { useState } from 'react';
import Navbar from './Navbar';
import BackendStatus from './BackendStatus';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBarChart2, FiActivity, FiTrendingUp, FiGrid, FiThumbsUp, FiTable, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const Layout = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { to: '/', label: 'Home', icon: <FiHome /> },
        { to: '/calculation', label: 'Calculation', icon: <FiBarChart2 /> },
        { to: '/estimate', label: 'Estimate', icon: <FiActivity /> },
        { to: '/predict', label: 'Predict', icon: <FiTrendingUp /> },
        { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
        { to: '/recommendations', label: 'Recommendations', icon: <FiThumbsUp /> },
        { to: '/view', label: 'Display', icon: <FiTable /> },
    ];

    const SidebarContent = ({ onNavigate }) => (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-700">
                <span className="text-sm font-semibold text-amber-400">{open ? 'Navigation' : ''}</span>
                <button
                    onClick={() => setOpen(!open)}
                    className="text-gray-300 hover:text-amber-400 p-1 rounded"
                    aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {open ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
            </div>
            <nav className="mt-2 px-2 space-y-1">
                {navItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => onNavigate && onNavigate()}
                            className={`group flex items-center rounded px-3 py-2 text-sm transition-colors ${active ? 'bg-amber-500 text-black' : 'text-gray-200 hover:bg-gray-700'}`}
                        >
                            <span className={`text-lg ${active ? 'text-black' : 'text-amber-400 group-hover:text-amber-300'}`}>{item.icon}</span>
                            {open && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto p-3 text-xs text-gray-400">
                {open ? '© Zerith' : ''}
            </div>
        </div>
    );

    const toggleSidebar = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setMobileOpen(true);
        } else {
            setOpen(!open);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen">
            <Navbar onToggleSidebar={toggleSidebar} />
            <div className="px-4 pt-20">
                <BackendStatus />
            </div>

            {/* Sidebar toggled via Navbar menu icon */}

            <div className="flex">
                {/* Desktop sidebar (hidden when closed; appears over content) */}
                <aside className="hidden md:block">
                    {open && (
                        <div className="fixed top-20 bottom-0 w-56 bg-gray-800 text-gray-100 shadow-inner">
                            <SidebarContent />
                        </div>
                    )}
                </aside>

                {/* Mobile sidebar overlay */}
                {mobileOpen && (
                    <div className="md:hidden fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                        <div className="absolute top-0 bottom-0 left-0 w-72 bg-gray-800 text-gray-100 shadow-xl">
                            <SidebarContent onNavigate={() => setMobileOpen(false)} />
                        </div>
                    </div>
                )}

                <main className={`flex-1 pt-6 pb-8 px-4 ${open ? 'md:ml-56' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;