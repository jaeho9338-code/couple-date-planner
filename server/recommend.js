import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const spots = JSON.parse(fs.readFileSync(path.join(__dirname, 'spots.json'), 'utf8'))
const homeIdeas = JSON.parse(fs.readFileSync(path.join(__dirname, 'home_ideas.json'), 'utf8'))

const MODEL = 'gemini-3.5-flash-lite'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function callGemini(apiKey, prompt, responseSchema, grounded = false) {
  const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
      ...(grounded ? { tools: [{ google_search: {} }] } : {}),
    }),
  })
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  return JSON.parse(text)
}

async function parsePrompt(apiKey, userPrompt) {
  const schema = {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: ['outing', 'home', 'off_topic'],
        description:
          'outing: 밖에 나가서 노는 데이트를 원함 (지역 무관 — 부산/양산은 물론 다른 국내 지역이나 해외 여행지도 포함). home: 집에서 할 데이트를 원하거나 나가기 귀찮다/쉬고싶다는 뜻. off_topic: 데이트와 무관한 말(생리현상, 잡담, 질문, 장난 등).',
      },
      note: {
        type: 'string',
        description: 'intent가 off_topic일 때만 채움: 짧고 다정한 한국어 한 문장. 그 외엔 빈 문자열.',
      },
      area: { type: 'string', description: '지역 키워드 (예: 서면, 광안리, 양산). 없으면 빈 문자열' },
      indoor: { type: 'string', enum: ['실내', '야외', '상관없음'] },
      budgetMax: { type: 'number', description: '1인 기준 예산 상한(원). 언급 없으면 0' },
      mood: { type: 'array', items: { type: 'string' } },
    },
    required: ['intent', 'note', 'area', 'indoor', 'budgetMax', 'mood'],
  }
  return callGemini(
    apiKey,
    `너는 커플 데이트 앱의 장소 추천 챗봇이야. 사용자 메시지를 보고 intent를 엄격하게 판단해. 절대 억지로 끼워맞추지 마.

예시:
- "똥마렵다" → intent: off_topic, note: "그건 제가 추천해드릴 수 있는 게 아니에요 ㅋㅋ 화장실부터 다녀오세요!"
- "오늘 날씨 어때" → intent: off_topic, note: "날씨는 제가 모르지만, 데이트는 언제든 물어봐요!"
- "집에서 뒹굴거리고 싶어" → intent: home
- "나가기 귀찮아, 그냥 집에서 뭐할까" → intent: home
- "이번주 토요일 광안리에서 저녁 데이트 추천해줘" → intent: outing

intent가 outing일 때만 area/indoor/budgetMax를 채우고, home/off_topic이면 기본값(빈 문자열/상관없음/0)으로 둬. mood는 intent가 outing이거나 home이면 분위기 키워드를 뽑아줘.

사용자 메시지: "${userPrompt}"`,
    schema,
  )
}

function filterCandidates(conditions) {
  return spots.filter((s) => {
    if (conditions.area && !s.area.includes(conditions.area) && !conditions.area.includes(s.area)) return false
    if (conditions.indoor === '실내' && !s.indoor) return false
    if (conditions.indoor === '야외' && s.indoor) return false
    if (conditions.budgetMax > 0 && s.budget > conditions.budgetMax) return false
    return true
  })
}

async function rankPicks(apiKey, userPrompt, candidates, label, recentLocations = []) {
  if (candidates.length === 0) return []
  const schema = {
    type: 'object',
    properties: {
      picks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['name', 'reason'],
        },
      },
    },
    required: ['picks'],
  }
  const list = candidates.map((c) => `- ${c.name} (${c.area ?? c.category}, 분위기: ${c.mood.join('/')})`).join('\n')
  const recentLine =
    recentLocations.length > 0
      ? `최근에 다녀온 곳: ${recentLocations.join(', ')}. 후보 중 같은 곳이 있으면 웬만하면 피하고, 다른 선택지가 정말 없을 때만 골라줘.\n\n`
      : ''
  const result = await callGemini(
    apiKey,
    `데이트 요청: "${userPrompt}"\n\n${recentLine}아래 ${label} 후보 중에서 요청 의도에 가장 잘 맞는 것을 최대 4개 골라서 이유와 함께 알려줘.\n${list}`,
    schema,
  )
  return result.picks.map((p) => {
    const match = candidates.find((c) => c.name === p.name)
    return match ? { ...match, reason: p.reason } : { name: p.name, reason: p.reason }
  })
}

async function generateFreeformPicks(apiKey, userPrompt, conditions, recentLocations = []) {
  const schema = {
    type: 'object',
    properties: {
      picks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            area: { type: 'string', description: '장소가 위치한 동네/도시' },
            reason: { type: 'string' },
          },
          required: ['name', 'area', 'reason'],
        },
      },
    },
    required: ['picks'],
  }
  const budgetLine = conditions.budgetMax > 0 ? `1인 예산은 약 ${conditions.budgetMax}원 이내로 맞춰줘.` : ''
  const recentLine =
    recentLocations.length > 0 ? `최근에 다녀온 곳: ${recentLocations.join(', ')}. 웬만하면 겹치지 않게 해줘.` : ''
  const result = await callGemini(
    apiKey,
    `데이트 요청: "${userPrompt}"\n\n구글 검색으로 "${conditions.area}" 지역에 실제 운영 중인 데이트하기 좋은 장소를 검색해서 최대 4개 추천해줘. 정확한 상호명을 알려줘(대충 지어내지 말고). ${budgetLine} ${recentLine}`,
    schema,
    true,
  )
  return result.picks
}

export async function recommend(userPrompt, apiKey, recentLocations = []) {
  const conditions = await parsePrompt(apiKey, userPrompt)

  if (conditions.intent === 'off_topic') {
    return { conditions, picks: [], note: conditions.note }
  }
  if (conditions.intent === 'home') {
    const picks = await rankPicks(apiKey, userPrompt, homeIdeas, '집 데이트 아이디어', recentLocations)
    return { conditions, picks, isHome: true }
  }
  const candidates = filterCandidates(conditions)
  if (candidates.length < 3 && conditions.area) {
    const picks = await generateFreeformPicks(apiKey, userPrompt, conditions, recentLocations)
    return { conditions, picks, usedFreeform: true }
  }
  const picks = await rankPicks(apiKey, userPrompt, candidates, '데이트 장소', recentLocations)
  return { conditions, picks }
}

function filterCandidatesForCourse(conditions) {
  return spots.filter((s) => {
    if (conditions.area && !s.area.includes(conditions.area) && !conditions.area.includes(s.area)) return false
    if (conditions.indoor === '실내' && !s.indoor) return false
    if (conditions.indoor === '야외' && s.indoor) return false
    return true
  })
}

async function buildCourse(apiKey, userPrompt, conditions, candidates, recentLocations = []) {
  const schema = {
    type: 'object',
    properties: {
      courseArea: { type: 'string', description: '코스가 진행되는 대표 지역(구/동네)' },
      summary: { type: 'string', description: '코스 전체를 한 문장으로 요약' },
      stops: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            order: { type: 'number' },
            timeHint: { type: 'string', description: '예: 오후 2시, 저녁, 밤 등' },
            reason: { type: 'string', description: '이 순서에 이 장소가 어울리는 이유, 앞 장소와의 동선/흐름 설명' },
          },
          required: ['name', 'order', 'timeHint', 'reason'],
        },
      },
    },
    required: ['courseArea', 'summary', 'stops'],
  }
  const list = candidates
    .map((c) => `- ${c.name} (${c.area}, ${c.category}, 예산 약 ${c.budget}원, 분위기: ${c.mood.join('/')})`)
    .join('\n')
  const budgetLine = conditions.budgetMax > 0 ? `전체 코스 예산은 1인 약 ${conditions.budgetMax}원 이내로 맞춰줘.` : ''
  const recentLine =
    recentLocations.length > 0
      ? `최근에 다녀온 곳: ${recentLocations.join(', ')}. 후보 중 같은 곳이 있으면 웬만하면 피하고, 다른 선택지가 정말 없을 때만 골라줘.\n`
      : ''
  return callGemini(
    apiKey,
    `데이트 요청: "${userPrompt}"\n\n아래 후보 장소들로 2~4곳을 골라서 하루 동선이 자연스럽게 이어지는 데이트 코스를 짜줘. 같은 지역(구/동네) 안에서 걸어서 이동 가능하도록 가까운 곳끼리 묶고, 카페→맛집→야외활동→야경 같은 자연스러운 흐름을 고려해줘. ${budgetLine}\n${recentLine}\n후보:\n${list}`,
    schema,
  )
}

async function generateFreeformCourse(apiKey, userPrompt, conditions, recentLocations = []) {
  const schema = {
    type: 'object',
    properties: {
      courseArea: { type: 'string', description: '코스가 진행되는 대표 지역/도시' },
      summary: { type: 'string', description: '코스 전체를 한 문장으로 요약' },
      stops: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            order: { type: 'number' },
            timeHint: { type: 'string', description: '예: 오후 2시, 저녁, 밤 등' },
            reason: { type: 'string', description: '이 순서에 이 장소가 어울리는 이유, 앞 장소와의 동선/흐름 설명' },
          },
          required: ['name', 'order', 'timeHint', 'reason'],
        },
      },
    },
    required: ['courseArea', 'summary', 'stops'],
  }
  const budgetLine = conditions.budgetMax > 0 ? `전체 코스 예산은 1인 약 ${conditions.budgetMax}원 이내로 맞춰줘.` : ''
  const recentLine =
    recentLocations.length > 0 ? `최근에 다녀온 곳: ${recentLocations.join(', ')}. 웬만하면 겹치지 않게 해줘.` : ''
  return callGemini(
    apiKey,
    `데이트 요청: "${userPrompt}"\n\n구글 검색으로 "${conditions.area}" 지역에 실제 운영 중인 장소들을 검색해서, 하루 동선이 자연스럽게 이어지는 데이트 코스를 2~4곳으로 짜줘. 정확한 상호명을 알려줘(대충 지어내지 말고). 걸어서 이동 가능하게 가까운 곳끼리 묶고, 카페→맛집→야외활동→야경 같은 자연스러운 흐름을 고려해줘. ${budgetLine} ${recentLine}`,
    schema,
    true,
  )
}

export async function recommendCourse(userPrompt, apiKey, recentLocations = []) {
  const conditions = await parsePrompt(apiKey, userPrompt)

  if (conditions.intent === 'off_topic') {
    return { conditions, courseArea: '', summary: '', stops: [], note: conditions.note }
  }
  if (conditions.intent === 'home') {
    const picks = await rankPicks(apiKey, userPrompt, homeIdeas, '집 데이트 아이디어', recentLocations)
    return { conditions, courseArea: '', summary: '', stops: [], picks, isHome: true }
  }
  const candidates = filterCandidatesForCourse(conditions)
  if (candidates.length < 3 && conditions.area) {
    const result = await generateFreeformCourse(apiKey, userPrompt, conditions, recentLocations)
    const stops = result.stops.sort((a, b) => a.order - b.order)
    return { conditions, courseArea: result.courseArea, summary: result.summary, stops, usedFreeform: true }
  }
  const result = await buildCourse(apiKey, userPrompt, conditions, candidates, recentLocations)
  const stops = result.stops
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const match = candidates.find((c) => c.name === s.name)
      return match ? { ...match, timeHint: s.timeHint, reason: s.reason } : { name: s.name, timeHint: s.timeHint, reason: s.reason }
    })
  return { conditions, courseArea: result.courseArea, summary: result.summary, stops }
}
