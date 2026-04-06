"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutContent from "./components/LayoutContent";
import { CreateLayoutDialog } from "../components/CreateLayoutDialog";

interface LayoutPageProps {
  params: {
    id: string;
    layoutId: string;
  }
}

export default function LayoutPage({ params }: LayoutPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Only redirect if layoutId is undefined or empty
    if (!params.layoutId || params.layoutId === "") {
      router.replace(`/dashboard/move/${params.id}/layout/create`);
    }
  }, [params.id, params.layoutId]);

  // If we're on the create route, show the CreateLayoutDialog component
  if (params.layoutId === "create") {
    return <CreateLayoutDialog moveId={params.id} />;
  }

  return (
    <div className="container py-10">
      <LayoutContent moveId={params.id} layoutId={params.layoutId} />
    </div>
  );
} 