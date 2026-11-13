"use client";

import dynamic from "next/dynamic";

export const SheetEditor = dynamic(() => import("@/features/dtf/sheet-editor"), { ssr: false });
