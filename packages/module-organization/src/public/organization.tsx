import { type LoaderFunctionArgs, data, useLoaderData } from "react-router";
import { Link, useSearchParams } from "react-router";
import { OrganizationService } from "../service.server";
import { cn } from "@repo/ui/utils";
import { PageHeader } from "@repo/ui";

// Loader to fetch groups and members
export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const selectedGroupId = url.searchParams.get("groupId");

    // Fetch all groups for the sidebar
    const groups = await OrganizationService.getGroups();

    // Fetch members based on selection or show all
    let members = await OrganizationService.getMembers();

    // If a specific group is selected, filter members server-side or client-side.
    // Since getMembers returns all, we can filter here or in service.
    // For scalability, service filtering is better, but for now we filter here as getMembers fetches all.
    // Actually, getMembers fetches ALL. Let's filter in memory for now as the org chart won't be huge.
    if (selectedGroupId) {
        members = members.filter(m => m.group_id === selectedGroupId);
    }

    return data({ groups, members, selectedGroupId });
}

export default function OrganizationPublic() {
    const { groups, members, selectedGroupId } = useLoaderData<typeof loader>();

    // Group members by their group to display sections
    // If a group is selected, we only show that group's members.
    // If no group is selected, we show all groups and their members (or maybe just the first one? User said "click group to show").
    // "좌측에는 직책 그룹이 리스트로 나오고 그 직책 그룹을 누르면 하위 모든 임원 명단을 직책 그룹별로 불러와서 보여주면 되"
    // Does this mean initial state shows nothing? Or all? Usually showing the first group or all is better.
    // Let's defaulted to showing ALL if nothing selected, or maybe just the first group if list is long.
    // Let's show filtered list. if selectedGroupId is null, show all.

    // We need to group the `members` data by `organization_groups` for display because members list is flat.
    // Access `m.organization_groups` (relation)

    // Helper to group members by Group ID
    const membersByGroup = groups.reduce((acc: any, group: any) => {
        const groupMembers = members.filter((m: any) => m.group_id === group.id);
        if (groupMembers.length > 0) {
            acc[group.id] = groupMembers;
        }
        return acc;
    }, {});


    return (
        <div className="w-full">
            <PageHeader
                title="임원진 소개"
                description="서울대학교 화공생명공학부 동문회의 임원진을 소개합니다."
            />
            <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar: Group List */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="space-y-1 sticky top-8">
                            <Link
                                to="."
                                className={cn(
                                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    !selectedGroupId
                                        ? "bg-blue-50 text-blue-700 border border-blue-100" // Styled to match SNU theme roughly or standard sidebar
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                전체 보기
                            </Link>
                            {groups.map((group: any) => (
                                <Link
                                    key={group.id}
                                    to={`?groupId=${group.id}`}
                                    className={cn(
                                        "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        selectedGroupId === group.id
                                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    {group.name}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Right Content: Members Grid */}
                    <main className="flex-1 min-w-0">
                        {groups.map((group: any) => {
                            // If filtering, skip groups that are not selected
                            if (selectedGroupId && group.id !== selectedGroupId) return null;

                            const groupMembers = membersByGroup[group.id];
                            if (!groupMembers || groupMembers.length === 0) return null;

                            return (
                                <div key={group.id} className="mb-12 last:mb-0">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                                        {group.name}
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupMembers.map((member: any) => (
                                            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col h-full">
                                                    <div className="mb-4">
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 mb-2">
                                                            {member.organization_positions?.name}
                                                        </span>
                                                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                                    </div>

                                                    <div className="mt-auto space-y-2 text-sm text-gray-500">
                                                        {member.major && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-16 text-gray-400 text-xs">전공</span>
                                                                <span className="font-medium text-gray-700">{member.major}</span>
                                                            </div>
                                                        )}
                                                        {member.gisu && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-16 text-gray-400 text-xs">기수</span>
                                                                <span className="font-medium text-gray-700">{member.gisu}회</span> {/* Assuming 'gisu' is stored as number/string representing cohort count as per previous request context */}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {members.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">등록된 임원이 없습니다.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
