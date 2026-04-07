'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  Home, 
  Activity, 
  Trophy, 
  Target, 
  Scroll, 
  Backpack, 
  ShoppingCart, 
  User,
  Sun,
  Moon,
  Menu,
  BarChart3,
  Zap,
  Coins,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewType = 'dashboard' | 'activities' | 'challenges' | 'achievements' | 'quests' | 'inventory' | 'shop' | 'profile' | 'stats';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { character, logout } = useGame();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (!character) return null;

  const navItems: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Adventurer\'s Hall', icon: Home },
    { id: 'activities', label: 'Quest Log', icon: Activity },
    { id: 'stats', label: 'Battle Records', icon: BarChart3 },
    { id: 'achievements', label: 'Hall of Legends', icon: Trophy },
    { id: 'quests', label: 'Quest Board', icon: Scroll },
    { id: 'inventory', label: 'Backpack', icon: Backpack },
    { id: 'shop', label: 'Merchant', icon: ShoppingCart },
    { id: 'profile', label: 'Hero Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="WellnessQuest logo" className="h-10 w-10 rounded-xl object-cover shrink-0" />
              <span className="text-xl font-bold">WellnessQuest</span>
            </div>

            {/* Center Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.slice(0, 5).map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    variant="ghost"
                    className={`gap-2 ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Gold Balance */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">{character?.gold || 0}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navItems.slice(5).map(item => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <div className="border-t my-1" />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                      router.replace('/login');
                    }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="grid grid-cols-5 gap-1 p-2 pb-3">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant="ghost"
                className={`flex flex-col h-auto py-2 px-1 gap-1 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <header className="md:hidden border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-40">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="WellnessQuest logo" className="h-8 w-8 rounded-lg object-cover shrink-0" />
            <span className="font-bold">WellnessQuest</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Gold Badge Mobile */}
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-sm">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold">{character?.gold || 0}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.slice(5).map(item => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
                <div className="border-t my-1" />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    router.replace('/login');
                  }}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
