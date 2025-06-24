// pages/DispatchForm.tsx
"use client";

import { useState } from "react";
import DispatchFormPage1 from "../components/DispatchFormPage1";
import DispatchFormPage2 from "../components/DispatchFormPage2";
import DispatchFormPage3 from "../components/DispatchFormPage3";

export default function DispatchForm() {
  const [page, setPage] = useState(1);

  const renderPage = () => {
    switch (page) {
      case 1:
        return <DispatchFormPage1 />;
      case 2:
        return <DispatchFormPage2 />;
      case 3:
        return <DispatchFormPage3 />;
    }
  };

  return (
    <div className="p-6 w-full">
      {renderPage()}

      <div className="flex items-center justify-end mt-6 pr-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="text-2xl px-4 py-2 rounded disabled:opacity-30"
        >
          ◄
        </button>

        <div className="text-2xl font-semibold">{page}</div>

        <button
          disabled={page === 3}
          onClick={() => setPage(page + 1)}
          className="text-2xl px-4 py-2 rounded disabled:opacity-30"
        >
          ►
        </button>
      </div>
    </div>
  );
}
