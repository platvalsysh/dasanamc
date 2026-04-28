import { ArrowLeft, FileText, Image, LayoutDashboard, MessageSquare, List, Layers } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { NavLink, Outlet, useLoaderData, useParams } from "react-router";
import { SolapiSmsProvider } from "../../../.server/providers/SolapiSmsProvider";

export async function loader({ params }: LoaderFunctionArgs) {
    const { profile } = params;
    if (!profile) throw new Error("Profile is required");
    
    // Validate that this profile is indeed a solapi profile
    const provider = new SolapiSmsProvider(profile);
    const profileData = await provider.getProfile();

    return { 
        profileName: profileData.name
    };
}

export default function SolapiDashboardLayout() {
  const { profileName } = useLoaderData<typeof loader>();
  const params = useParams();

  const baseUrl = `/admin/sms/solapi/dashboard/${profileName}`;

  const navItems = [
      { label: "Overview", href: `${baseUrl}/overview`, icon: LayoutDashboard },
      { label: "SMS Test", href: `${baseUrl}/test/sms`, icon: MessageSquare },
      { label: "LMS Test", href: `${baseUrl}/test/lms`, icon: FileText },
      { label: "MMS Test", href: `${baseUrl}/test/mms`, icon: Image },
      { label: "History", href: `${baseUrl}/history`, icon: List },
      { label: "Group History", href: `${baseUrl}/history-group`, icon: Layers },
      { label: "Kakao Channels", href: `${baseUrl}/kakao/channels`, icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-muted/40">
       {/* Sidebar */}
       <aside className="w-64 border-r bg-background hidden md:block">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                 <NavLink to="/admin/sms" className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="h-4 w-4" /> Back to List
                 </NavLink>
            </div>
            <div className="flex-1 py-2">
                 <div className="px-4 py-2">
                     <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                         {profileName} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Solapi)</span>
                     </h2>
                 </div>
                 <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.href} 
                            to={item.href}
                            className={({ isActive }) => 
                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? "bg-muted text-primary" : "text-gray-500 dark:text-gray-400"}`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                 </nav>
            </div>
       </aside>

       {/* Module Content */}
       <div className="flex flex-col flex-1 overflow-auto">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
                <div className="w-full flex-1">
                    <h1 className="text-lg font-semibold md:text-2xl">
                         Solapi Dashboard
                    </h1>
                </div>
            </header>
            <main className="flex-1 p-4 lg:p-6 p-8">
                <Outlet />
            </main>
       </div>
    </div>
  );
}
