"use client"

import React, { useEffect, useState } from 'react';
import { House, FolderDown, Blocks, ShieldX, Settings, HelpCircle, LayoutGrid } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"



const mainMenuItems = [
  
  { id: 'home', icon: House, label: '홈', url: '/' },
  { id: 'detection', icon: FolderDown, label: '검출내역', url: '/image/detection' },
  { id: 'gambling', icon: Blocks, label: '도박', url: '/gambling' },
  // { id: 'block', icon: ShieldX, label: '차단', url: '/block' }
];

export function MainNav() {
  const [selectedNav, setSelectedNav] = useState('');
  const [activeSubmenu, setActiveSubmenu] = useState('default');
  const pathname = usePathname();

  const handleNavClick = (navId: string) => {
    setSelectedNav(navId);
    setActiveSubmenu('default');
  };

  useEffect(() => {
    const currentMenuItem = mainMenuItems.find(item => item.url === pathname);
    if (currentMenuItem) {
      setSelectedNav(currentMenuItem.id);
    }
  }, [pathname]);

  return (
    <div className="h-full flex overflow-hidden ">
      {/* Nav Icons */}
      <div className="w-15 bg-[#0d47a1] flex-none h-full flex flex-col rounded-r-md min-h-screen">
        <div className="p-4 flex items-center justify-center">
          <Link href="/" onClick={() => setSelectedNav('')}>
            <img src="/meer.ico" alt="logo" className="w-8 h-8"/>
          </Link>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 py-2 overflow-y-auto ">
            <nav className="flex flex-col">
              {mainMenuItems.map(({id, icon: Icon, label, url}) => (
                <TooltipProvider key={id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={url}>
                        <button
                          className={`w-full px-4 py-3 flex items-center justify-center transition-colors ${
                            selectedNav === id
                              ? 'bg-blue-400 text-white'
                              : 'text-gray-100 hover:bg-blue-400 hover:text-white'
                          }`}
                          onClick={() => handleNavClick(id)}
                        >
                          <Icon className="w-5 h-5"/>
                        </button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
    </div>
  );
}