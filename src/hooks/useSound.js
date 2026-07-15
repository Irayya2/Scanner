import { useCallback, useRef } from 'react'

/**
 * useSound — generates beep sounds via Web Audio API.
 * No external audio files required.
 *
 * Usage:
 *   const { playSuccess, playWarning, playError } = useSound()
 */
export function useSound() {
  const audioCtxRef = useRef(null)

  // Lazily create AudioContext on first use (browser requires user gesture)
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  /**
   * Play a tone.
   * @param {number} frequency - Hz
   * @param {number} duration  - seconds
   * @param {'sine'|'square'|'sawtooth'|'triangle'} type
   * @param {number} volume    - 0..1
   */
  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getCtx()
      const oscillator = ctx.createOscillator()
      const gainNode   = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      // Envelope: attack + release
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (err) {
      console.warn('[Sound] Audio playback error:', err)
    }
  }, [getCtx])

  /** ✅ Success — bright upward arpeggio */
  const playSuccess = useCallback(() => {
    playTone(523, 0.12, 'sine', 0.3)  // C5
    setTimeout(() => playTone(659, 0.12, 'sine', 0.3), 100)  // E5
    setTimeout(() => playTone(784, 0.20, 'sine', 0.35), 200) // G5
  }, [playTone])

  /** ⚠️ Warning — double warning blip */
  const playWarning = useCallback(() => {
    playTone(440, 0.15, 'square', 0.2)  // A4
    setTimeout(() => playTone(440, 0.15, 'square', 0.2), 250)
  }, [playTone])

  /** ❌ Error — descending buzz */
  const playError = useCallback(() => {
    playTone(300, 0.12, 'sawtooth', 0.25)
    setTimeout(() => playTone(220, 0.25, 'sawtooth', 0.3), 100)
  }, [playTone])

  return { playSuccess, playWarning, playError }
}
