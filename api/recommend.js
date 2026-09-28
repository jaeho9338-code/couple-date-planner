import { recommend, recommendCourse } from '../server/recommend.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  try {
    const { prompt, mode, recentLocations } = req.body
    const result =
      mode === 'course'
        ? await recommendCourse(prompt, process.env.GEMINI_API_KEY, recentLocations)
        : await recommend(prompt, process.env.GEMINI_API_KEY, recentLocations)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
