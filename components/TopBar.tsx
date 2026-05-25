'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Filter, Calendar, Store, Camera, RefreshCw, LayoutGrid } from 'lucide-react';
import { useDashboardContext } from '@/components/DashboardProvider';

type DropdownType = 'shoppers' | 'filter' | 'date' | null;

export function TopBar() {
  const { setChartSelectorOpen } = useDashboardContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  return (
    <header
      className="flex-shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Main top row */}
      <div
        className="flex items-center justify-between px-6 relative"
        style={{ height: 'var(--topbar-height)' }}
        ref={dropdownRef}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
              style={{ background: 'var(--color-primary)' }}
            >
              O
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              OlyRetail
            </span>
          </div>

          <div className="h-5 w-px" style={{ background: 'var(--color-border)' }} />

          <span className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>
            Landmark Asia
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Qualified shoppers advanced dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('shoppers')}
              className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors text-left shadow-sm border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-1)' }}
            >
              <div>
                <p className="text-[13px] font-semibold leading-tight">Qualified Shopper</p>
                <p className="text-[11px] font-medium leading-tight mt-0.5" style={{ color: 'var(--color-text-3)' }}>Kids Excluded</p>
              </div>
              <ChevronDown size={14} strokeWidth={2.5} style={{ color: 'var(--color-text-3)' }} />
            </button>
            {activeDropdown === 'shoppers' && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl border z-50 bg-white overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                {/* Search */}
                <div className="px-3 py-2 border-b relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full text-sm outline-none py-1 pr-8"
                    style={{ color: '#4B5563' }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div>

                {/* Kids Excluded Row */}
                <div className="relative group px-4 py-3 flex items-center justify-between border-b hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm font-semibold text-gray-800">Kids Excluded</span>
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-serif font-bold italic cursor-help peer">i</div>
                  
                  {/* Hover Info Tooltip */}
                  <div className="absolute top-full right-4 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 space-y-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Name</p>
                      <p className="text-[13px] text-gray-600">Kids Excluded</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Gender</p>
                      <p className="text-[13px] text-gray-600">male, female</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Age Groups</p>
                      <p className="text-[13px] text-gray-600">(13-21 years), (22-35 years), (35+ years)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bell */}
          <button
            className="relative p-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text-3)' }}
            aria-label="Notifications"
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <Bell size={18} strokeWidth={1.5} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-error)' }}
            />
          </button>

          {/* Avatar */}
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'var(--color-primary)' }}
            >
              AM
            </div>
            <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-6 py-2.5 border-t"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface-2)',
          transition: 'background 200ms ease',
        }}
      >
        <div className="relative">
          <button
            onClick={() => toggleDropdown('filter')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
            style={{
              borderColor: activeDropdown === 'filter' ? 'var(--color-primary)' : 'var(--color-border)',
              color: activeDropdown === 'filter' ? 'var(--color-primary)' : 'var(--color-text-2)',
              background: activeDropdown === 'filter' ? 'var(--color-primary-light)' : 'var(--color-surface)',
            }}
          >
            <Filter size={14} strokeWidth={1.5} />
            Filters
          </button>
          {activeDropdown === 'filter' && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-md border shadow-lg z-50 p-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              {['All Zones', 'Entrance', 'Exit'].map(f => (
                <button key={f} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100" style={{ color: 'var(--color-text-1)' }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => toggleDropdown('date')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
            style={{
              borderColor: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-border)',
              color: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-text-2)',
              background: activeDropdown === 'date' ? 'var(--color-primary-light)' : 'var(--color-surface)',
            }}
          >
            <Calendar size={14} strokeWidth={1.5} />
            Filter By Date
          </button>
          {activeDropdown === 'date' && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-md border shadow-lg z-50 p-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map(f => (
                <button key={f} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100" style={{ color: 'var(--color-text-1)' }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px mx-1" style={{ background: 'var(--color-border)' }} />

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
        >
          <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text-1)' }}>8</span>
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Stores</span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
        >
          <Camera size={14} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
          <span className="text-xs">
            <span className="font-semibold" style={{ color: 'var(--color-success)' }}>24</span>
            <span style={{ color: 'var(--color-text-3)' }}> online · </span>
            <span className="font-semibold" style={{ color: 'var(--color-error)' }}>2</span>
            <span style={{ color: 'var(--color-text-3)' }}> offline</span>
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartSelectorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{ color: 'var(--color-text-1)', background: '#F3F4F6' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#E5E7EB'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
          >
            <LayoutGrid size={13} strokeWidth={1.5} />
            Customise Charts
          </button>
          <span className="text-xs ml-2" style={{ color: 'var(--color-text-3)' }}>
            Last Refresh: <span className="font-medium" style={{ color: 'var(--color-text-2)' }}>just now</span>
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-surface)' }}
          >
            <RefreshCw size={13} strokeWidth={1.5} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
