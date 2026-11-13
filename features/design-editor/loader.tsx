"use client";

import dynamic from "next/dynamic";

export const DesignEditor = dynamic(() => import("@/features/design-editor/editor"), { ssr: false });
