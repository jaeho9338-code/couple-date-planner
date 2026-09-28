export default function Skeleton({ count = 3, height = 80 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, marginBottom: 12 }} />
      ))}
    </>
  )
}
