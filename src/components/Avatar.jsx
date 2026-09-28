export default function Avatar({ id, url, size = 24 }) {
  const color = id === 'A' ? 'var(--blue-a)' : 'var(--pink-b)'
  if (url) {
    return (
      <img
        src={url}
        alt={id}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: size * 0.5,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {id?.[0]}
    </span>
  )
}
