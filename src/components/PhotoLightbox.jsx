import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function PhotoLightbox({ photos, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex)

  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={photos[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12 }}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((index - 1 + photos.length) % photos.length)
            }}
            style={navButtonStyle('left')}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((index + 1) % photos.length)
            }}
            style={navButtonStyle('right')}
          >
            ›
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              color: '#fff',
              fontSize: 13,
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: 999,
            }}
          >
            {index + 1} / {photos.length}
          </div>
        </>
      )}
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 28 }}>
        ×
      </button>
    </div>,
    document.body
  )
}

function navButtonStyle(side) {
  return {
    position: 'absolute',
    [side]: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 24,
  }
}
