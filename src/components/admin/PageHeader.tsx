// src/components/PageHeader.tsx (or wherever it is)
import React from 'react';

const PageHeader = ({ title }: { title: string }) => {
  return (
    <h1 className="text-2xl font-bold mb-6">{title}</h1>
  );
};

export default PageHeader; // <--- MUST HAVE THIS