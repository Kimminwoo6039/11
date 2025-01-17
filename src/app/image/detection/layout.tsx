"use client"
import {SidebarGroupLabel, SidebarMenuButton, SidebarMenuItem, SidebarMenu, SidebarGroup, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import CaptureToDetection from "@/components/detection/capture-to-detection";
import { usePathname } from 'next/navigation';
import localFont from "next/font/local";



export default function Layout({children}: {children: React.ReactNode}) {
  const pathname = usePathname();

  return (
      <>
      
        <header
            className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* <SidebarTrigger className="-ml-1"/> */}
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  이미지
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block"/>
                <BreadcrumbItem>
                  <Link href="/image/detection">
                    <BreadcrumbPage >선정성 이미지</BreadcrumbPage>
                  </Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <CaptureToDetection/>
      
        {/* Sidebar Submenu */}

        
        <div className="flex flex-1 flex-row gap-0 p-2 border-t border-border ">

        <div className="h-full flex flex-col p-3">
          <div className="flex-1 w-full">
            <h2 className="text-[18px] font-bold mb-4">검출 내역</h2>
            <Link href="/image/detection">
              <span className={`text-sm text-gray-600 mb-4 block pl-1 ${pathname === '/image/detection' ? 'text-blue-600 font-semibold' : ''}`}>
                선정성 검출 이미지
              </span>
            </Link>
            <Link href="/image/gambling">
              <span className={`text-sm text-gray-600 block pl-1${pathname === '/image/gambling' ? 'text-blue-600 font-semibold' : ''}`}>
                도박 검출 이미지
              </span>
            </Link>
          </div>
        </div>
          {/* <div className="border border-border rounded-lg p-2"> 
            <SidebarGroup>
              <SidebarGroupLabel>검출내역</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/image/detection">
                    <SidebarMenuButton isActive={pathname === '/image/detection'}>
                      <span>선정성 검출 이미지</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/image/gambling">
                    <SidebarMenuButton isActive={pathname === '/image/gambling'}>
                      <span>도박 검출 이미지</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup> 
          </div>   */}
          <div className="flex-1 border-l border-border rounded-md p-4">
          {children}
          </div>
        </div>

      </>
  )
}