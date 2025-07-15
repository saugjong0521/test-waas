'use client';

import { notFound } from "next/navigation";
import { useLoginStore } from "@/store/useLoginStore";

type PageProps = {
  params: { id: string };
};

export default function Page({ params }: PageProps) {
  const { id: paramId } = params;
  const { id: storeId } = useLoginStore();
  const id = storeId || paramId;

  if (!id) return notFound();

  return (
    <div className="text-white p-4">
      <h1 className="text-xl font-bold text-[#000]">Dynamic Page for ID: {id}</h1>
    </div>
  );
}
