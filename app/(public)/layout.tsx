import { Navigation } from "@/components/navigation";
import { Suspense } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>
      {children}
    </>
  );
}

