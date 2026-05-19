import { type MetaFunction } from "react-router";
import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { prisma } from "@repo/database";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Admin" },
    { name: "description", content: "Admin Dashboard" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const [totalUsers, totalUsersLastMonth] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({
      where: {
        created_at: {
          lt: thirtyDaysAgo,
        },
      },
    }),
  ]);

  // Calculate growth percentages
  // If last month was 0, and current is > 0, it's 100% growth (technically infinite, but treated as new)
  // If both 0, 0%
  
  const calculateGrowth = (current: number, past: number) => {
    if (past === 0) return current > 0 ? 100 : 0;
    return ((current - past) / past) * 100;
  };

  return {
    totalUsers: {
      value: totalUsers,
      change: calculateGrowth(totalUsers, totalUsersLastMonth),
    },
  };
}

export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>();

  const stats = [
    {
      title: "전체 회원",
      value: data.totalUsers.value.toLocaleString(),
      change: data.totalUsers.change,
      icon: <Users className="w-5 h-5" />,
      description: "전체 가입 사용자",
      color: "blue",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">대시보드</h1>
        <p className="text-gray-500">
          시스템 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.change !== null ? (
                <>
                  <span className={`flex items-center font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-2">지난달 대비</span>
                </>
              ) : (
                <span className="text-gray-500">{stat.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
