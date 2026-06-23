import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TypeBreadcrumbPropsType {
  name: string;
  to: string;
}
interface BreadcrumbsProps {
  data: TypeBreadcrumbPropsType[];
}
export default function Breadcrumbs({ data }: BreadcrumbsProps) {
  const router = useRouter();

  if (!data) return;
  return (
    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 ">
      {data &&
        data.map((item: TypeBreadcrumbPropsType, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-4"
          >
            <button
              onClick={() => router.push(item.to)}
              className="hover:text-sky-600 transition-colors capitalize"
            >
              {item.name}
            </button>
            {data.length - 1 !== idx && <ChevronRight className="w-3 h-3" />}
          </div>
        ))}
    </nav>
  );
}
