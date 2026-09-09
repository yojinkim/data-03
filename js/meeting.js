const meetingListEl = document.getElementById('meeting-list');
const mFormPanel = document.getElementById('form-panel');
const meetingForm = document.getElementById('meeting-form');
let meetings = [];

async function loadMeetings() {
  meetingListEl.innerHTML = '<div class="empty-state">불러오는 중…</div>';
  const { data, error } = await supabaseClient
    .from('cook_meetings')
    .select('*')
    .order('meeting_date', { ascending: false });

  if (error) {
    handleSupabaseError(error, '모임 일정을 불러오지 못했어요');
    meetingListEl.innerHTML = '<div class="empty-state">불러오기에 실패했어요. 새로고침 해보세요.</div>';
    return;
  }

  meetings = data || [];
  renderMeetings();
}

function renderMeetings() {
  if (meetings.length === 0) {
    meetingListEl.innerHTML = '<div class="empty-state">등록된 모임 일정이 없어요. 첫 일정을 등록해보세요.</div>';
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  meetingListEl.innerHTML = meetings.map(m => {
    const { day, ym } = monthDayParts(m.meeting_date);
    const isUpcoming = m.meeting_date >= today;
    return `
    <div class="meeting-card" data-id="${m.id}">
      <div class="date-block">
        <div class="day">${day}</div>
        <div class="ym">${ym}</div>
      </div>
      <div>
        <span class="chip ${isUpcoming ? 'herb' : ''}">${isUpcoming ? '예정' : '지난 모임'}</span>
        <h3>${escapeHtml(m.theme)}</h3>
        <div class="tags">
          <span>${escapeHtml(m.location)}</span>
          ${m.meeting_time ? `<span>· ${escapeHtml(m.meeting_time)}</span>` : ''}
          ${m.host ? `<span>· 호스트 ${escapeHtml(m.host)}</span>` : ''}
          ${m.max_participants ? `<span>· 정원 ${m.max_participants}명</span>` : ''}
        </div>
        ${m.description ? `<p style="margin-top:10px; white-space:pre-wrap;">${escapeHtml(m.description)}</p>` : ''}
      </div>
      <div class="row-actions">
        <button class="btn btn-quiet btn-sm" data-action="edit">수정</button>
        <button class="btn btn-danger btn-sm" data-action="delete">삭제</button>
      </div>
    </div>
  `;
  }).join('');
}

meetingListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = e.target.closest('.meeting-card');
  const id = card.dataset.id;
  if (btn.dataset.action === 'edit') openForm(meetings.find(m => m.id === id));
  if (btn.dataset.action === 'delete') deleteMeeting(id);
});

function openForm(meeting) {
  mFormPanel.classList.add('open');
  document.getElementById('form-title').textContent = meeting ? '모임 일정 수정' : '새 모임 일정 등록';
  document.getElementById('btn-submit').textContent = meeting ? '수정 완료' : '등록하기';
  document.getElementById('meeting-id').value = meeting ? meeting.id : '';
  document.getElementById('meeting-date').value = meeting ? meeting.meeting_date : '';
  document.getElementById('meeting-time').value = meeting ? (meeting.meeting_time || '') : '';
  document.getElementById('meeting-location').value = meeting ? meeting.location : '';
  document.getElementById('meeting-theme').value = meeting ? meeting.theme : '';
  document.getElementById('meeting-host').value = meeting ? (meeting.host || '') : '';
  document.getElementById('meeting-max').value = meeting ? (meeting.max_participants || '') : '';
  document.getElementById('meeting-description').value = meeting ? (meeting.description || '') : '';
  mFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  mFormPanel.classList.remove('open');
  meetingForm.reset();
  document.getElementById('meeting-id').value = '';
}

document.getElementById('btn-new').addEventListener('click', () => openForm(null));
document.getElementById('btn-cancel').addEventListener('click', closeForm);

meetingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('meeting-id').value;
  const maxVal = document.getElementById('meeting-max').value;
  const payload = {
    meeting_date: document.getElementById('meeting-date').value,
    meeting_time: document.getElementById('meeting-time').value.trim(),
    location: document.getElementById('meeting-location').value.trim(),
    theme: document.getElementById('meeting-theme').value.trim(),
    host: document.getElementById('meeting-host').value.trim(),
    max_participants: maxVal ? parseInt(maxVal, 10) : null,
    description: document.getElementById('meeting-description').value.trim(),
  };

  if (id) {
    payload.updated_at = new Date().toISOString();
    const { error } = await supabaseClient.from('cook_meetings').update(payload).eq('id', id);
    if (error) return handleSupabaseError(error, '수정에 실패했어요');
    showToast('모임 일정을 수정했어요');
  } else {
    const { error } = await supabaseClient.from('cook_meetings').insert(payload);
    if (error) return handleSupabaseError(error, '등록에 실패했어요');
    showToast('모임 일정을 등록했어요');
  }

  closeForm();
  loadMeetings();
});

async function deleteMeeting(id) {
  if (!confirm('이 모임 일정을 삭제할까요?')) return;
  const { error } = await supabaseClient.from('cook_meetings').delete().eq('id', id);
  if (error) return handleSupabaseError(error, '삭제에 실패했어요');
  showToast('삭제했어요');
  loadMeetings();
}

document.addEventListener('DOMContentLoaded', loadMeetings);
