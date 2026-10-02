"use client";

import dynamic from "next/dynamic";

export const HoldStudio = dynamic(
  () => import("./HoldCanvas").then((m) => m.HoldCanvas),
  {
    ssr: false,
    loading: () => <div className="min-h-0 w-full flex-1 bg-paper" />,
  },
);
