"use client"
import {SidebarMenuButton, SidebarMenuItem, SidebarMenu, SidebarGroup, SidebarTrigger, SidebarGroupLabel} from "@/components/ui/sidebar";
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
import { usePathname } from "next/navigation";

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
                  <Link href="/image/gambling">
                    <BreadcrumbPage>도박성 이미지</BreadcrumbPage>
                  </Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <CaptureToDetection/>

        {/* Sidebar Submenu */}

        <div className="flex flex-1 flex-row gap-0 p-4">
          <div className="border border-border rounded-lg p-2"> 
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
          </div>  
          <div className="flex-1 border border-border rounded-lg p-6">
            {children}
          </div>
        </div>  

        
      </>
  )
}