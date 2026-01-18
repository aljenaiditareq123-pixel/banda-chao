'use client';

import VerifiedBadge from './VerifiedBadge';

interface UserNameWithBadgeProps {
  name: string;
  isVerified?: boolean;
  className?: string;
  badgeSize?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

/**
 * Component to display user name with verification badge
 * يعرض اسم المستخدم مع علامة التحقق الزرقاء
 */
export default function UserNameWithBadge({
  name,
  isVerified = false,
  className = '',
  badgeSize = 'sm',
  showBadge = true,
}: UserNameWithBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{name}</span>
      {isVerified && showBadge && <VerifiedBadge size={badgeSize} />}
    </span>
  );
}
