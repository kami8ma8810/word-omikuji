import { Link } from 'react-router-dom'
import { DailyDrawCard } from '@/presentation/components/features/DailyDrawCard'
import './HomePage.css'

export const HomePage = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1 className="app-title">一語福引</h1>
        <p className="app-subtitle">毎日一語、新しい言葉に出会おう</p>
      </header>

      <main className="page-content">
        <DailyDrawCard />

        <nav className="mt-8 flex flex-col gap-3 max-w-md mx-auto">
          <Link 
            to="/known"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            知ってる語リスト
          </Link>
          <Link 
            to="/unknown"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            知らない語リスト
          </Link>
          <Link 
            to="/ranking"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            ランキング
          </Link>
        </nav>
      </main>

      <footer className="page-footer">
        <p className="footer-text">
          語彙データ: <a href="https://www.edrdg.org/jmdict/j_jmdict.html" target="_blank" rel="noopener noreferrer">JMdict</a>, <a href="https://wordnet.princeton.edu/" target="_blank" rel="noopener noreferrer">WordNet</a>
        </p>
      </footer>
    </div>
  )
}