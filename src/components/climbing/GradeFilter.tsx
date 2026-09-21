"use client";

import { archiveHref, FILTER_GRADES, type GradeFilter } from "@/lib/types/climbing";

type GradeFilterProps = {
  active: GradeFilter;
  onSelect?: (grade: GradeFilter) => void;
};

const FILTERS: GradeFilter[] = ["ALL", ...FILTER_GRADES];

export function GradeFilter({ active, onSelect }: GradeFilterProps) {
  return (
    <nav
      aria-label="Grade filter"
      className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/10 pb-3"
    >
      {FILTERS.map((grade) => {
        const isActive = active === grade;
        const className = isActive
          ? "text-kicker tracking-kicker uppercase text-ink"
          : "text-kicker tracking-kicker uppercase text-mute hover:text-ink";

        if (onSelect) {
          return (
            <button
              key={grade}
              type="button"
              aria-pressed={isActive}
              className={`${className} cursor-pointer`}
              onClick={() => onSelect(grade)}
            >
              {grade}
            </button>
          );
        }

        const href = archiveHref(grade);
        return (
          <a key={grade} href={href} className={className}>
            {grade}
          </a>
        );
      })}
    </nav>
  );
}
