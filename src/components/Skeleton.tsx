import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = "bg-apple-gray animate-pulse";
  const variantClasses = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4 w-full"
  };

  return (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-apple-border/30 p-0">
          <Skeleton className="h-32 w-full rounded-none" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="w-4 h-4" variant="circular" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
      <div className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-10 border border-apple-border/40 flex flex-col md:flex-row gap-6 md:gap-8">
        <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[20px] md:rounded-[28px]" />
        <div className="flex-1 space-y-4 md:pt-2">
          <Skeleton className="h-8 md:h-10 w-2/3" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
            <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <Skeleton className="h-8 w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-48 w-full rounded-[22px] md:rounded-[24px]" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-[22px] md:rounded-[24px]" />
          <Skeleton className="h-48 w-full rounded-[22px] md:rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
