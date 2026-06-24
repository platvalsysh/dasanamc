import { cn } from "@repo/ui/utils";
import {
  Stethoscope,
  Activity,
  ScanLine,
  Cat,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "분과별 협진 진료",
    description:
      "내과·외과·영상의학과 협진으로 최상의 의료 서비스를 제공합니다.",
  },
  {
    icon: Activity,
    title: "외과 대표원장 집도",
    description:
      "정형외과부터 신경외과까지 외과 전공 대표원장이 직접 집도합니다.",
  },
  {
    icon: ScanLine,
    title: "대학병원급 CT",
    description:
      "대학병원급 CT·영상장비로 촬영 당일 정밀 판독이 가능합니다.",
  },
  {
    icon: Cat,
    title: "고양이 전용 공간",
    description: "예민한 고양이를 위한 분리된 전용 대기·처치·입원 공간.",
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
            왜 다산원동물의료센터일까요?
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl">
            대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료.
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
