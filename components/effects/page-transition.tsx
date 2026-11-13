"use client";

import { useEffect, useRef, type ReactNode } from "react";

let firstMount = true;

/**
 * İstemci içi gezinmede içerik hafifçe yukarı kayarak girer. İlk sayfa yüklemesinde
 * animasyon yoktur (LCP korunur). Efekt kapalıysa CSS hiçbir şey yapmaz.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstMount) {
      firstMount = false;
      return;
    }
    ref.current?.classList.add("page-enter");
  }, []);
  return <div ref={ref}>{children}</div>;
}
