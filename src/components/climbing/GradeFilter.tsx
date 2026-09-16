import Link from "next/link";
import { FILTER_GRADES, type GradeFilter } from "@/lib/types/climbing";

type GradeFilterProps = {
  active: GradeFilter;
};

const FILTERS: GradeFilter[] = ["ALL", ...FILTER_GRADES];

export function GradeFilter({ active }: GradeFilterProps) {
  return (
    <nav aria-label="Grade filter" className="flex flex-wrap gap-x-6 gap-y-2">
      {FILTERS.map((grade) => {
        const href = grade === "ALL" ? "/" : `/?grade=${grade}`;
        const isActive = active === grade;
        return (
          <Link
            key={grade}
            href={href}
            className={
              isActive
                ? "text-sm tracking-[0.22em] uppercase"
                : "text-sm tracking-[0.22em] uppercase text-neutral-400 hover:text-black"
            }
          >
            {grade}
          </Link>
        );
      })}
    </nav>
  );
}
