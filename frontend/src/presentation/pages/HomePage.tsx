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
      </main>

      <footer className="page-footer">
        <p className="footer-text">
          語彙データ: <a href="https://www.edrdg.org/jmdict/j_jmdict.html" target="_blank" rel="noopener noreferrer">JMdict</a>, <a href="https://wordnet.princeton.edu/" target="_blank" rel="noopener noreferrer">WordNet</a>
        </p>
      </footer>
    </div>
  )
}