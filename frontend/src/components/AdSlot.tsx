'use client';

import React, { useEffect, useState } from 'react';

interface AdSlotProps {
  slotCode: string;
  name?: string;
  className?: string;
  fallbackText?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotCode,
  className = '',
  fallbackText = 'Espacio Publicitario Patrocinado • Google AdSense',
}) => {
  const [slotConfig, setSlotConfig] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/ads/slots')
      .then((res) => res.json())
      .then((data) => {
        if (data && data[slotCode]) {
          setSlotConfig(data[slotCode]);
        }
      })
      .catch(() => {});
  }, [slotCode]);

  // Si está explícitamente desactivado desde el panel admin, no renderizar nada
  if (slotConfig && !slotConfig.isActive) {
    return null;
  }

  return (
    <div
      className={`my-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center text-slate-400 overflow-hidden transition ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 min-h-[90px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded">
            Publicidad
          </span>
          <span className="text-xs font-medium text-slate-500">
            {slotConfig?.name || fallbackText}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-md">
          {slotConfig?.publisherId
            ? `Google AdSense [${slotConfig.slotCode}] • Slot: ${slotConfig.slotId}`
            : 'Espacio administrable sin modificar código. Cumplimiento estricto con las directrices de AdSense.'}
        </p>
      </div>
    </div>
  );
};

export default AdSlot;
