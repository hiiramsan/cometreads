// src/components/EpubReader.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import Epub, { type Rendition, type Book } from 'epubjs'

const FONTS = ['Georgia', 'Palatino', 'Arial', 'Helvetica']

const THEMES = {
  parchment: { bg: '#FFFDF5', fg: '#2C2C2A' },
  paper:     { bg: '#F0EDE4', fg: '#2C2C2A' },
  dark:      { bg: '#1C1C1E', fg: '#E8E6DF' },
  night:     { bg: '#0D2137', fg: '#CBD8E3' },
}

type ThemeKey = keyof typeof THEMES

type Props = {
  url: string
  title?: string
}

export default function EpubReader({ url, title }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)

  const [fontSize, setFontSize] = useState(18)
  const [font, setFont] = useState('Georgia')
  const [theme, setTheme] = useState<ThemeKey>('parchment')
  const [showMenu, setShowMenu] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const applyStyles = useCallback((rendition: Rendition) => {
    const { bg, fg } = THEMES[theme]
    rendition.themes.default({
      body: {
        background: `${bg} !important`,
        color: `${fg} !important`,
        'font-family': `${font}, serif !important`,
        'font-size': `${fontSize}px !important`,
        'line-height': '1.8 !important',
        padding: '2rem 3rem !important',
        margin: '0 !important',
      },
      p: {
        'font-size': `${fontSize}px !important`,
        color: `${fg} !important`,
        'margin-bottom': '1em !important',
      },
      h1: { color: `${fg} !important`, 'font-size': `${fontSize + 8}px !important` },
      h2: { color: `${fg} !important`, 'font-size': `${fontSize + 4}px !important` },
    })
  }, [fontSize, font, theme])

  useEffect(() => {
    if (!viewerRef.current) return

    bookRef.current?.destroy()

    const book = Epub(url)
    bookRef.current = book

    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: 'none',
    })
    renditionRef.current = rendition

    applyStyles(rendition)

    rendition.display().then(() => setIsReady(true))

    rendition.on('relocated', (location: any) => {
      const label = book.navigation?.toc?.find(
        (item: any) => item.href === location?.start?.href
      )?.label
      if (label) setChapterTitle(label.trim())

      const pct = book.locations?.percentageFromCfi(location.start.cfi)
      if (typeof pct === 'number') setProgress(Math.round(pct * 100))
    })

    book.locations.generate(1024).catch(() => {})

    return () => {
      book.destroy()
    }
  }, [url])

  useEffect(() => {
    if (!renditionRef.current || !isReady) return
    applyStyles(renditionRef.current)
    renditionRef.current.views().forEach((view: any) => view.pane?.render())
  }, [fontSize, font, theme, isReady, applyStyles])

  const prev = () => renditionRef.current?.prev()
  const next = () => renditionRef.current?.next()

  const { bg, fg } = THEMES[theme]

  return (
    <div className="flex flex-col h-screen p-4 gap-4">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <span className="text-white/50 text-sm truncate max-w-xs">
          {title || 'Reading'}
        </span>
        <span className="text-white/70 text-sm font-medium truncate max-w-xs">
          {chapterTitle}
        </span>
        <button
          onClick={() => setShowMenu(v => !v)}
          className="flex flex-col gap-1 p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Reading settings"
        >
          <span className="block w-5 h-0.5 bg-white/60 rounded" />
          <span className="block w-3.5 h-0.5 bg-white/60 rounded" />
          <span className="block w-4 h-0.5 bg-white/60 rounded" />
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">

        {/* Reader */}
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          <div
            ref={viewerRef}
            className="w-full h-full"
            style={{ background: bg }}
          />

          {/* Prev / Next */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/40 text-white transition"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/40 text-white transition"
          >
            ›
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500">
            <div
              className="h-full bg-red-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Settings panel */}
        {showMenu && (
          <div className="w-56 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 flex flex-col gap-5 shrink-0">

            {/* Font family */}
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs ml-1">Font</label>
              <select
                value={font}
                onChange={e => setFont(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {FONTS.map(f => <option key={f} value={f} className="bg-gray-900">{f}</option>)}
              </select>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs ml-1">Font size</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(s => Math.max(12, s - 2))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition flex items-center justify-center"
                >A−</button>
                <span className="flex-1 text-center text-white text-sm">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(s => Math.min(32, s + 2))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition flex items-center justify-center"
                >A+</button>
              </div>
            </div>

            {/* Background theme */}
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs ml-1">Background</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    title={key}
                    className="w-9 h-9 rounded-full transition"
                    style={{
                      background: val.bg,
                      outline: theme === key ? `2px solid white` : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}