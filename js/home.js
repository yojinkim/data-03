async function loadThisMonthMeeting() {
  const el = document.getElementById('this-month');
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseClient
    .from('cook_meetings')
    .select('*')
    .gte('meeting_date', today)
    .order('meeting_date', { ascending: true })
    .limit(1);

  if (error) {
    handleSupabaseError(error, '모임 정보를 불러오지 못했어요');
    el.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    el.innerHTML = `
      <div class="feature-empty">
        <h3>예정된 모임이 아직 없어요</h3>
        <p>다음 정기모임 일정이 등록되면 이곳에 표시됩니다.</p>
        <a href="meeting.html" class="btn btn-outline btn-sm">정기모임 페이지로</a>
      </div>`;
    return;
  }

  const m = data[0];
  const { day, ym } = monthDayParts(m.meeting_date);

  el.innerHTML = `
    <div class="feature-meeting">
      <div class="date-block">
        <div class="day">${day}</div>
        <div class="ym">${ym}</div>
      </div>
      <div>
        <h3>이번 달 모임 · ${escapeHtml(m.theme)}</h3>
        <p>${escapeHtml(m.location)}${m.meeting_time ? ' · ' + escapeHtml(m.meeting_time) : ''}${m.host ? ' · 호스트 ' + escapeHtml(m.host) : ''}</p>
      </div>
      <a href="meeting.html" class="btn">자세히 보기</a>
    </div>`;
}

async function loadNoticePreview() {
  const el = document.getElementById('notice-preview');
  const { data, error } = await supabaseClient
    .from('cook_notices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    handleSupabaseError(error, '공지사항을 불러오지 못했어요');
    el.innerHTML = '<div class="card"><p>불러오기에 실패했어요.</p></div>';
    return;
  }

  if (!data || data.length === 0) {
    el.innerHTML = '<div class="card"><p>등록된 공지사항이 없어요.</p></div>';
    return;
  }

  el.innerHTML = data.map(n => `
    <div class="card">
      <div class="meta">${formatDate(n.created_at)} · ${escapeHtml(n.author)}</div>
      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.content).slice(0, 70)}${n.content.length > 70 ? '…' : ''}</p>
    </div>
  `).join('');
}

async function loadRecipePreview() {
  const el = document.getElementById('recipe-preview');
  const { data, error } = await supabaseClient
    .from('cook_recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    handleSupabaseError(error, '레시피를 불러오지 못했어요');
    el.innerHTML = '<div class="card"><p>불러오기에 실패했어요.</p></div>';
    return;
  }

  if (!data || data.length === 0) {
    el.innerHTML = '<div class="card"><p>등록된 레시피가 없어요.</p></div>';
    return;
  }

  el.innerHTML = data.map(r => `
    <div class="card">
      <span class="chip ${r.category === '메인' ? 'herb' : r.category === '디저트' ? 'marigold' : ''}">${escapeHtml(r.category)}</span>
      <h3>${escapeHtml(r.title)}</h3>
      <p>${escapeHtml(r.content).slice(0, 60)}${r.content.length > 60 ? '…' : ''}</p>
      <div class="meta">by ${escapeHtml(r.author)}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadThisMonthMeeting();
  loadNoticePreview();
  loadRecipePreview();
});
