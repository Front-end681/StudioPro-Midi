import React from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

interface ConnectionBadgeProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'not_supported';
  retryCount?: number;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ status, retryCount }) => {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-bold uppercase tracking-wider border border-[#1D9E75]/20">
        <CheckCircle2 size={12} />
        Connected
      </span>
    );
  }

  if (status === 'connecting') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF9F27]/10 text-[#EF9F27] text-[10px] font-bold uppercase tracking-wider border border-[#EF9F27]/20">
        <RefreshCw size={12} className="animate-spin" />
        Connecting {retryCount !== undefined && retryCount > 0 && `(${retryCount}/5)`}
      </span>
    );
  }

  if (status === 'error' || status === 'not_supported') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E24B4A]/10 text-[#E24B4A] text-[10px] font-bold uppercase tracking-wider border border-[#E24B4A]/20">
        <XCircle size={12} />
        {status === 'not_supported' ? 'Not Supported' : 'Error'}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#242424] text-[#666] text-[10px] font-bold uppercase tracking-wider border border-[#2e2e2e]">
      <XCircle size={12} />
      Disconnected
    </span>
  );
};
