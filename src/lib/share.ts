import { getGuessStatuses } from './statuses'
import { unicodeSplit } from './words'
import { GAME_TITLE } from '../constants/strings'
import { GameStats } from './localStorage'
import { UAParser } from 'ua-parser-js'

const parser = new UAParser()
const browser = parser.getBrowser()

const EMOJI_TILES = ['🟩', '🟨', '⬛']

const attemptShare = (shareData: object) => {
  return (
    browser.name?.toUpperCase().indexOf('FIREFOX') === -1 &&
    typeof navigator.share === 'function' &&
    navigator.canShare &&
    navigator.canShare(shareData)
  )
}

const doShare = async (
  shareData: { title: string; text: string },
  textToShare: string,
  handleShareToClipboard: () => void
) => {
  try {
    if (attemptShare(shareData)) {
      await navigator.share(shareData)
      return
    }
  } catch {
    // fall through to clipboard
  }
  await navigator.clipboard.writeText(textToShare)
  handleShareToClipboard()
}

export const shareStatus = async (
  solution: string,
  guesses: string[],
  lost: boolean,
  handleShareToClipboard: () => void,
  hardMode: boolean,
  maxChallenges: number
) => {
  const score = lost ? 'X' : guesses.length
  const modeTag = hardMode ? ' [HARD]' : ''
  const header = `${GAME_TITLE}${modeTag} — ${solution} — ${score}/${maxChallenges} (${solution.length} letters)`
  const textToShare =
    `${header}\n${window.location.href}\n` +
    generateEmojiGrid(solution, guesses, EMOJI_TILES)

  await doShare(
    { title: `${GAME_TITLE} — ${solution}`, text: textToShare },
    textToShare,
    handleShareToClipboard
  )
}

export const generateEmojiGrid = (
  solution: string,
  guesses: string[],
  tiles: string[]
) => {
  return guesses
    .map((guess) => {
      const status = getGuessStatuses(solution, guess)
      const splitGuess = unicodeSplit(guess)
      return splitGuess
        .map((_, i) => {
          switch (status[i]) {
            case 'correct':
              return tiles[0]
            case 'present':
              return tiles[1]
            default:
              return tiles[2]
          }
        })
        .join('')
    })
    .join('\n')
}

export const shareStats = async (
  stats: GameStats,
  hardMode: boolean,
  handleShareToClipboard: () => void
) => {
  const modeTag = hardMode ? ' [HARD]' : ' [NORMAL]'
  const lines = [
    `${GAME_TITLE}${modeTag} Stats`,
    `${window.location.href}`,
    ``,
    `🎮 Played:   ${stats.totalGames}`,
    `✅ Win Rate: ${stats.successRate}%`,
    `🔥 Streak:   ${stats.currentStreak}`,
    `🏆 Best:     ${stats.bestStreak}`,
  ]

  const maxCount = Math.max(...stats.winDistribution, 1)
  const bars = stats.winDistribution
    .map((count, i) => {
      const filled = Math.round((count / maxCount) * 8)
      const bar = '█'.repeat(filled) + '░'.repeat(8 - filled)
      return `${String(i + 1).padStart(2)}: ${bar} ${count}`
    })
    .join('\n')

  lines.push(``, `Guess Distribution:`, bars)

  const textToShare = lines.join('\n')

  await doShare(
    { title: `${GAME_TITLE}${modeTag} Stats`, text: textToShare },
    textToShare,
    handleShareToClipboard
  )
}