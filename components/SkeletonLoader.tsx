
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-zinc-200 mb-4" />
          <div className="h-3 w-1/4 bg-zinc-200 mb-2" />
          <div className="h-4 w-3/4 bg-zinc-200 mb-2" />
          <div className="h-3 w-1/2 bg-zinc-100" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
