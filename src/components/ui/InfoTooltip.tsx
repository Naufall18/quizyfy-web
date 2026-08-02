import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '../../lib/cn'

interface InfoTooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const POS_CLS = {
  top:    'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left:   'right-full top-1/2 mr-2 -translate-y-1/2',
  right:  'left-full top-1/2 ml-2 -translate-y-1/2',
}

/**
 * InfoTooltip — ikon (i) dengan tooltip saat hover.
 * Contoh:
 *   <InfoTooltip content="KKM adalah nilai minimum kelulusan." />
 */
export function InfoTooltip({ content, position = 'top', className }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={content}
    >
      <Info size={14} className="cursor-help text-muted transition-colors hover:text-primary" />
      {show && (
        <div className={cn(
          'absolute z-50 w-max max-w-[220px] rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg',
          POS_CLS[position],
        )}>
          {content}
          {/* Arrow */}
          <span className={cn(
            'absolute h-2 w-2 rotate-45 bg-ink',
            position === 'top'    && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            position === 'left'   && 'right-[-4px] top-1/2 -translate-y-1/2',
            position === 'right'  && 'left-[-4px] top-1/2 -translate-y-1/2',
          )} />
        </div>
      )}
    </span>
  )
}
