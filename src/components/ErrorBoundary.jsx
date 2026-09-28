import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'linear-gradient(160deg, var(--coral-400), var(--peach-300))',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 40 }}>💔</span>
          <p style={{ color: '#fff', margin: 0, fontWeight: 700 }}>어라, 뭔가 꼬였나봐요</p>
          <p style={{ color: '#fff', margin: 0, fontSize: 13, opacity: 0.9 }}>새로고침하면 괜찮아질 거예요</p>
          <button
            className="pill"
            style={{ background: '#fff', color: 'var(--coral-500)' }}
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
