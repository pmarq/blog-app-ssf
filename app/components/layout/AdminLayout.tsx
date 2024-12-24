// components/layout/AdminLayout.tsx

import React, { ReactNode } from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import AdminNav from "../common/nav/AdminNav";

interface Props {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex">
      <AdminNav />
      <div className="flex-1 p-4">{children}</div>
      {/* Create button */}
      <Link href="dashboard/posts/create">
        <span
          className="bg-secondary-dark dark:bg-secondary-light text-primary dark:text-primary-dark 
        fixed z-10 right-10 bottom-10 p-3 rounded-full hover:scale-90 shadow-sm transition flex items-center justify-center"
        >
          <FilePlus size={24} />
        </span>
      </Link>
    </div>
  );
}
