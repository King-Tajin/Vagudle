import { GameStats } from '../../lib/localStorage'

type ProgressProps = {
  index: number
  size: number
  label: string
  isCurrentDayStatRow: boolean
}

const Progress = ({ index, size, label, isCurrentDayStatRow }: ProgressProps) => {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span
        className="font-pixel text-xs flex-shrink-0 text-right tabular-nums"
        style={{ width: 18, color: '#9ca3af' }}
      >
        {index + 1}
      </span>
      <div className="flex-1 flex items-center gap-2">
        <div
          className="relative flex-1 h-5"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-500"
            style={{
              width: size > 0 ? `${size}%` : '3px',
              background: isCurrentDayStatRow
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : 'linear-gradient(90deg, #334155, #475569)',
            }}
          />
        </div>
        <span
          className="font-pixel text-xs flex-shrink-0 tabular-nums text-right"
          style={{ width: 20, color: isCurrentDayStatRow ? '#86efac' : '#9ca3af' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

type HistogramProps = {
  gameStats: GameStats
  isGameWon: boolean
  numberOfGuessesMade: number
  maxChallenges: number
}

export const Histogram = ({
  gameStats,
  isGameWon,
  numberOfGuessesMade,
  maxChallenges,
}: HistogramProps) => {
  const winDistribution = gameStats.winDistribution.slice(0, maxChallenges)
  const maxValue = Math.max(...winDistribution, 1)

  return (
    <div className="w-full px-1">
      {winDistribution.map((value, i) => (
        <Progress
          key={i}
          index={i}
          isCurrentDayStatRow={isGameWon && numberOfGuessesMade === i + 1}
          size={Math.round(90 * (value / maxValue))}
          label={String(value)}
        />
      ))}
    </div>
  )
}