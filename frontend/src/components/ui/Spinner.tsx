interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'terra' | 'forest' | 'brass' | 'teal' | 'white'
  label?: string
}

const sizeMap = { sm: 20, md: 32, lg: 48 }
const colorMap = {
  terra:  { track: 'rgba(224, 90, 56, 0.15)', fill: '#E05A38' },
  forest: { track: 'rgba(59, 82, 73, 0.15)', fill: '#3B5249' },
  brass:  { track: '#C9A84C26', fill: '#C9A84C' },
  teal:   { track: '#4EC9B026', fill: '#4EC9B0' },
  white:  { track: 'rgba(255,255,255,0.2)', fill: 'white' },
}

export function Spinner({ size = 'md', variant = 'brass', label = 'Loading…' }: SpinnerProps) {
  const px = sizeMap[size]
  const { track, fill } = colorMap[variant]
  const r = (px - 6) / 2
  const circ = 2 * Math.PI * r

  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} className="animate-spin-slow">
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={track} strokeWidth="4" />
        <circle
          cx={px / 2} cy={px / 2} r={r}
          fill="none" stroke={fill} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.7}
        />
      </svg>
    </span>
  )
}

export default Spinner
