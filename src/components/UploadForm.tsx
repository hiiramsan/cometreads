import React, { useEffect, useState } from 'react'

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
                    throw new Error('Google Books request failed')
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
    }

    return (
        <section className="max-w-2xl mx-auto mt-6 px-4">
            <h1 className="text-white mb-8 text-center text-3xl font-serif font-bold">Add to my bookshelf</h1>

            <div className="grid grid-cols-1 gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl mb-6">
                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Search Books</label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Search by title or author"
                        />
                        <div className="text-sm text-white/60">
                            {isSearching ? 'Searching...' : 'Type to search'}
                        </div>
                    </div>
                </div>

                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                    <p className="text-sm text-white/40 ml-1">Keep typing to search...</p>
                )}

                {searchError && (
                    <p className="text-sm text-rose-300">{searchError}</p>
                )}

                {showResults && (
                    <div className="grid gap-3">
                        {searchResults.length === 0 && !isSearching ? (
                            <p className="text-sm text-white/60">No results yet.</p>
                        ) : null}
                        {searchResults.map((result) => (
                            <button key={result.id} type="button" onClick={() => handleSelectBook(result)} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white hover:bg-white/10 transition">
                                {
                                    result.coverUrl ? (
                                        <img src={result.coverUrl} alt="" className="h-16 w-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-16 w-12 rounded-lg bg-white/10" />
                                    )
                                }
                                < div >
                                    <p className="font-semibold">{result.title || 'Untitled'}</p>
                                    <p className="text-sm text-white/60">{result.authors.join(', ') || 'Unknown author'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )
                }
            </div >

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">

                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Book title</label>
                    <input name="title" type="text" value={book.title} onChange={handleChange} required maxLength={100} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Ej: Rayuela" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm ml-1">Author</label>
                    <input name="author" type="text" value={book.author} onChange={handleChange} required maxLength={50} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Julio Cortázar" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-white/60 text-sm ml-1">Pages</label>
                        <input name="pages" type="number" min="1" max="10000" value={book.pages} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder='#' />
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
                    <input name="img" type="url" value={book.img} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="https://..." />
                </div>

                <button type="submit" className="mt-4 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/80 transition shadow-lg cursor-pointer hover:shadow-xl">
                    Save Book
                </button>

            </form>
        </section >
    )
}

export default UploadForm
