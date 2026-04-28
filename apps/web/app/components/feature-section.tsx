import { cn } from "@repo/ui/utils";
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "동문 네트워크",
    description:
      "전 세계 각지에서 활동하는 동문들과의 강력한 네트워크를 제공합니다.",
  },
  {
    icon: GraduationCap,
    title: "멘토링 프로그램",
    description:
      "선배가 후배를 이끌어주는 멘토링 프로그램을 통해 성장을 지원합니다.",
  },
  {
    icon: Calendar,
    title: "다양한 행사",
    description:
      "신년회, 등반대회, 학술 세미나 등 다양한 온/오프라인 행사를 개최합니다.",
  },
  {
    icon: BookOpen,
    title: "학술 지원",
    description: "최신 학술 정보 공유 및 연구 지원 프로그램을 운영합니다.",
  },
];

interface FeatureSectionProps {
  className?: string;
}

export function FeatureSection({ className }: FeatureSectionProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            동창회 활동
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl">
            화학생물공학부 동창회는 동문 여러분을 위해 다양한 활동을 지원합니다.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
