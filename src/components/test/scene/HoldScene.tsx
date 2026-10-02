"use client";

import { Suspense } from "react";
import { Camera } from "./Camera";
import { ClimbingHold } from "./ClimbingHold";
import { Lights } from "./Lights";
import { Wall } from "./Wall";

export function HoldScene() {
  return (
    <>
      <color attach="background" args={["#c4b49a"]} />
      <Camera />
      <Lights />
      <Suspense fallback={null}>
        <Wall />
      </Suspense>
      <ClimbingHold />
    </>
  );
}
