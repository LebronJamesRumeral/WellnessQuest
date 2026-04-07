'use client';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export default function BrandMark({ size = 'md', className = '', showLabel = false, labelClassName = '' }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/icon.png"
        alt="WellnessQuest logo"
        className={`${sizeMap[size]} rounded-lg object-cover shrink-0`}
      />
      {showLabel && (
        <span className={`font-bold text-foreground ${labelClassName}`}>WellnessQuest</span>
      )}
    </div>
  );
}
