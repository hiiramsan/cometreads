# CometReads 

A pleasant, minimalist space to track your reading journey. Built to keep track of what you're reading, what you've finished, and what you want to read next.

## Features

- **Personal Bookshelf**: Organize your library with status tracking (Reading, Completed, Want to Read).
- **Reading Timeline**: Visualize your reading history over time.
- **Clean Interface**: A distraction-free UI designed for book lovers.
- **Secure Authentication**: User accounts managed securely via Supabase.

## Tech Stack

I build this project using a modern, performance-focused stack:

- **[Astro](https://astro.build/)**: For a fast, content-focused frontend.
- **[Tailwind CSS](https://tailwindcss.com/)**: For rapid, beautiful styling (using v4).
- **[Supabase](https://supabase.com/)**: For backend-as-a-service (Database & Auth).
- **[Vercel](https://vercel.com/)**: For deployment.


## Motivation

I built CometReads to have a simple, personal clean space to track my reading over time. This also helped me explore and learn modern technologies which can help in the future.

## Visit CometReads

https://cometreads.vercel.app/

## Check out the code:

To run this project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cometreads.git
   cd cometreads
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

