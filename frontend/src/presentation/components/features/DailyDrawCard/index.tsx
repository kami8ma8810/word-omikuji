import { useState } from 'react'
import { useDailyWord } from '@/presentation/hooks/useDailyWord'
import { useVote } from '@/presentation/hooks/useVote'
import './styles.css'

export const DailyDrawCard = () => {
  const { word, loading, error: fetchError } = useDailyWord()
  const { submitting, stats, error: voteError, submitVote } = useVote()
  const [hasVoted, setHasVoted] = useState(false)

  if (loading) {
    return (
      <div className="daily-draw-card loading">
        <div className="spinner" />
        <p>今日の一語を準備中...</p>
      </div>
    )
  }

  if (fetchError || !word) {
    return (
      <div className="daily-draw-card error">
        <p>エラーが発生しました</p>
        <p className="error-message">{fetchError?.message || '語を取得できませんでした'}</p>
      </div>
    )
  }

  const handleVote = async (knows: boolean) => {
    await submitVote(word, knows)
    setHasVoted(true)
  }

  return (
    <div className="daily-draw-card">
      <div className="card-header">
        <h2 className="card-title">今日の一語</h2>
        <span className="language-badge">{word.language === 'ja' ? '日本語' : '英語'}</span>
      </div>

      <div className="card-content">
        <div className="word-display">
          <h1 className="word">{word.word}</h1>
          {word.reading && <p className="reading">{word.reading}</p>}
        </div>

        <div className="definition-section">
          <h3 className="definition-label">意味</h3>
          <p className="definition">{word.definition}</p>
        </div>

        <div className="metadata">
          <span className="part-of-speech">{word.partOfSpeech}</span>
          <span className="difficulty">難易度: {word.difficultyLevel}</span>
        </div>
      </div>

      {!hasVoted ? (
        <div className="card-actions">
          <button
            onClick={() => handleVote(false)}
            disabled={submitting}
            className="btn btn-unknown"
            aria-label="知らない"
          >
            知らない
          </button>
          <button
            onClick={() => handleVote(true)}
            disabled={submitting}
            className="btn btn-know"
            aria-label="知ってる"
          >
            知ってる
          </button>
        </div>
      ) : (
        <div className="stats-display">
          {stats ? (
            <>
              <h3 className="stats-title">みんなの投票結果</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">知ってる</span>
                  <span className="stat-value">{stats.knowCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">知らない</span>
                  <span className="stat-value">{stats.unknownCount}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="stats-loading">統計を取得中...</p>
          )}
          {voteError && (
            <p className="stats-error">統計の取得に失敗しました</p>
          )}
        </div>
      )}
    </div>
  )
}