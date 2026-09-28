import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { uploadPhotos } from '../lib/uploadPhoto.js'
import { todayStr } from '../lib/todayStr.js'

export default function DateLogForm({ profile, presetName, presetId, region, regionName, editLog, onDone, onCancel }) {
  const isEdit = !!editLog
  const [date, setDate] = useState(() => editLog?.date ?? todayStr())
  const [title, setTitle] = useState(editLog?.title ?? '')
  const [locationText, setLocationText] = useState(editLog?.location_text ?? presetName ?? '')
  const [memo, setMemo] = useState(editLog?.memo ?? '')
  const [existingPhotos, setExistingPhotos] = useState(editLog?.photo_urls ?? [])
  const [photos, setPhotos] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [photos])

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setUploadError(null)
    try {
      const newUrls = photos.length > 0 ? await uploadPhotos(photos) : []
      const photoUrls = [...existingPhotos, ...newUrls]
      const payload = {
        date,
        title,
        location_preset_id: presetId ?? (isEdit ? editLog.location_preset_id : null),
        location_text: presetId ? null : locationText,
        region: region ?? (isEdit ? editLog.region : null),
        memo,
        photo_urls: photoUrls,
        created_by: profile,
      }
      if (isEdit) {
        await supabase.from('date_logs').update(payload).eq('id', editLog.id)
      } else {
        await supabase.from('date_logs').insert(payload)
      }
      onDone()
    } catch (err) {
      setUploadError('저장에 실패했어요: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('이 기록을 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setUploadError(null)
    const { error } = await supabase.from('date_logs').delete().eq('id', editLog.id)
    if (error) {
      setUploadError('삭제에 실패했어요: ' + error.message)
      setSaving(false)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        날짜
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      {!presetId && (
        <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
          장소
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder={regionName ? `${regionName} 어디로 놀러갔어요? (예: 경복궁)` : '어디로 놀러갔어요?'}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
          />
        </label>
      )}
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        제목
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="오늘 우리 뭐 했지?"
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        메모
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="오늘 하루는 어땠어요? 남기고 싶은 이야기를 적어봐요"
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)', fontFamily: 'inherit' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        사진 (있으면 더 좋아요)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos([...e.target.files])}
          style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 13 }}
        />
      </label>
      {(existingPhotos.length > 0 || previewUrls.length > 0) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {existingPhotos.map((url) => (
            <div key={url} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} />
              <button
                type="button"
                onClick={() => setExistingPhotos(existingPhotos.filter((u) => u !== url))}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--coral-500)',
                  color: '#fff',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
          {previewUrls.map((url) => (
            <img key={url} src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </div>
      )}
      {uploadError && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{uploadError}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : isEdit ? '수정하기' : '추억으로 남기기'}
        </button>
      </div>
      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}
        >
          이 기록 삭제하기
        </button>
      )}
    </form>
  )
}
