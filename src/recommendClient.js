const API_URL = import.meta.env.DEV ? 'http://localhost:8799/api/recommend' : '/api/recommend'

export async function fetchRecommendation(prompt, mode = 'feed', recentLocations = []) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode, recentLocations }),
  })
  if (!res.ok) throw new Error('추천 요청 실패')
  return res.json()
}
