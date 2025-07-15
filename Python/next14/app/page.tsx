'use client';

import { useState } from "react";
import { useLoginStore } from "@/store/useLoginStore";
import Link from "next/link";

export default function Home() {
  const [inputId, setInputId] = useState("");
  const { id, setId } = useLoginStore();

  return (
    <div className="">
      <p className="text-[#000] font-bold text-[36px]">Main Page</p>
      <div className="mt-4">
        <input
          type="text"
          value={inputId}
          onChange={e => setInputId(e.target.value)}
          placeholder="Enter ID"
          className="border px-2 py-1 mr-2"
        />
        <button
          onClick={() => setId(inputId)}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Set ID
        </button>
      </div>
      {id && (
        <div className="mt-4">
          <p>Current ID: <span className="font-bold">{id}</span></p>
          <Link href={`/${id}`} className="text-blue-600 underline">Go to Dynamic Page</Link>
        </div>
      )}
    </div>
  );
}
