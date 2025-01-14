// components/layout/DefaultLayout.tsx

import React from "react";
import Head from "next/head";

interface DefaultLayoutProps {
  title: string;
  desc: string;
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  title,
  desc,
  children,
}) => {
  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark transition">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {/* Adicione outros metadados e links aqui, se necessário */}
      </Head>
      <div className="max-w-4xl mx-auto p-4">{children}</div>
    </div>
  );
};

export default DefaultLayout;
