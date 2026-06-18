import React, { useEffect, useRef, useState } from 'react'

type BookResult = {
    id: string
    title: string
    authors: string[]
    pageCount: number | null
    coverUrl: string | null
}

type BookFormState = {
    title: string
    author: string
    pages: number | ''
    status: string
    img: string
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)

const LoadingDots = () => (
    <span className="inline-flex gap-1 items-center ml-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
)

const SkeletonCard = () => (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 animate-pulse">
        <div className="h-20 w-14 rounded-lg bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
    </div>
)

const BookCover = ({ result }: { result: BookResult }) => {
    const [imgFailed, setImgFailed] = useState(false)

    if (result.coverUrl && !imgFailed) {
        return (
            <img
                src={result.coverUrl}
                alt=""
                className="h-20 w-14 rounded-lg object-cover shadow-md flex-shrink-0"
                onError={() => setImgFailed(true)}
            />
        )
    }

    return (
        <div className="h-20 w-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
        </div>
    )
}

const UploadForm = () => {
    const [book, setBook] = useState<BookFormState>({
        title: '',
        author: '',
        pages: '',
        status: 'plan to read',
        img: '',
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<BookResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target
        setBook((prev) => ({
            ...prev,
            [name]: name === 'pages' ? (value === '' ? '' : Number(value)) : value,
        }))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const res = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        })

        if (res.ok) {
            window.location.href = '/books'
        }
    }

    useEffect(() => {
        const trimmed = searchQuery.trim()

        if (trimmed.length < 3) {
            setSearchResults([])
            setSearchError('')
            setShowResults(false)
            return
        }

        setShowResults(true)

        const controller = new AbortController()
        const timeoutId = window.setTimeout(async () => {
            setIsSearching(true)
            try {
                const response = await fetch(
                    `/api/books/search?q=${encodeURIComponent(trimmed)}`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Search request failed')
                }

                const data: BookResult[] = await response.json()
                setSearchResults(data)
                setSearchError('')
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    setSearchError('Could not load results. Try again.')
                    setSearchResults([])
                } else {
                    setShowResults(false)
                }
            } finally {
                setIsSearching(false)
            }
        }, 400)

        return () => {
            window.clearTimeout(timeoutId)
            controller.abort()
        }
    }, [searchQuery])

    const handleSelectBook = (result: BookResult) => {
        setBook((prev) => ({
            ...prev,
            title: result.title || prev.title,
            author: result.authors[0] || prev.author,
            pages: result.pageCount ?? prev.pages,
            img: result.coverUrl || prev.img,
        }))
        setShowResults(false)
        setSearchQuery('')
    }

    return (
        <section className="max-w-2xl mx-auto mt-6 px-4">
            <h1 className="text-white mb-8 text-center text-3xl font-serif font-bold">Add to my bookshelf</h1>

            <div ref={searchRef} className="relative bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl mb-6">
                <label className="text-white/60 text-sm ml-1 mb-2 block">Search Books</label>
                <div className="relative">
                    <SearchIcon />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onFocus={() => {
                            if (searchQuery.trim().length >= 3 || searchResults.length > 0) {
                                setShowResults(true)
                            }
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Search by title, author, or ISBN..."
                    />
                </div>

                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && !isSearching && (
                    <p className="text-xs text-white/40 mt-2 ml-1">Keep typing to search...</p>
                )}

                {searchError && (
                    <p className="text-xs text-rose-300 mt-2 ml-1">{searchError}</p>
                )}

                {showResults && (
                    <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                        {isSearching && searchResults.length === 0 && (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <span className="text-xs text-white/40">Searching</span>
                                    <LoadingDots />
                                </div>
                            </>
                        )}

                        {!isSearching && searchResults.length > 0 && (
                            searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onClick={() => handleSelectBook(result)}
                                    className="w-full flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white hover:bg-white/10 hover:border-white/20 transition cursor-pointer group"
                                >
                                    <BookCover result={result} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold truncate group-hover:text-white transition">{result.title || 'Untitled'}</p>
                                        <p className="text-sm text-white/60 truncate">{result.authors.join(', ') || 'Unknown author'}</p>
                                    </div>
                                </button>
                            ))
                        )}

                        {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 3 && !searchError && (
                            <div className="text-center py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 mx-auto mb-2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                                <p className="text-sm text-white/40">No books found. Try a different search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Book title</label>
                    <input name="title" type="text" value={book.title} onChange={handleChange} required maxLength={100} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Rayuela" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Author</label>
                    <input name="author" type="text" value={book.author} onChange={handleChange} required maxLength={50} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Julio Cortázar" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-white/60 text-sm ml-1">Pages</label>
                        <input name="pages" type="number" min="1" max="10000" value={book.pages} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="#" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-white/60 text-sm ml-1">Status</label>
                        <select name="status" value={book.status} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <option value="plan to read" className="bg-gray-900">Plan to read</option>
                            <option value="reading" className="bg-gray-900">Reading</option>
                            <option value="completed" className="bg-gray-900">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Cover URL (Image)</label>
                    <input name="img" type="url" value={book.img} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="https://..." />
                </div>

                <button type="submit" className="mt-4 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/80 transition shadow-lg cursor-pointer hover:shadow-xl">
                    Save Book
                </button>
            </form>
        </section>
    )
}

export default UploadForm
