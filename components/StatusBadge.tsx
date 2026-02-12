
import React from 'react';
import { ImageStatus } from '../types';

const statusConfig: Record<ImageStatus, { label: string; className: string }> = {
  draft: { label: '下書き', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  pending_review: { label: '承認待ち', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  approved: { label: '承認済み', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  rejected: { label: '差し戻し', className: 'bg-rose-50 text-rose-600 border-rose-100' },
  revising: { label: '修正中', className: 'bg-amber-50 text-amber-600 border-amber-100' },
};

export const StatusBadge: React.FC<{ status: ImageStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider border whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
};
