'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  MessageSquare,
  BarChart2,
  Settings,
  Flame,
  ChevronsUpDown,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/dashboard/widgets', label: 'Widgets', icon: Layers },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
]

interface DashboardSidebarProps {
  userEmail?: string
  userName?: string
}

export function DashboardSidebar({ userEmail, userName }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">RedHotChatbot</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} className="gap-2.5">
                        <item.icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-sidebar-accent transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName || 'Account'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="gap-2">
                  <User className="h-4 w-4" />
                  Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
