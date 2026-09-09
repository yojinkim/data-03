const noticeListEl = document.getElementById('notice-list');
const formPanel = document.getElementById('form-panel');
const noticeForm = document.getElementById('notice-form');
let notices = [];

async function loadNotices() {
  noticeListEl.innerHTML = '<div class="empty-state">불러오는 중…</div>';
  const { data, error } = await supabaseClient
    .from('cook_notices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, '공지사항을 불러오지 못했어요');
    noticeListEl.innerHTML = '<div class="empty-state">불러오기에 실패했어요. 새로고침 해보세요.</div>';
    return;
  }

  notices = data || [];
  renderNotices();
}

function renderNotices() {
  if (notices.length === 0) {
    noticeListEl.innerHTML = '<div class="empty-state">아직 등록된 공지사항이 없어요. 첫 글을 남겨보세요.</div>';
    return;
  }

  noticeListEl.innerHTML = notices.map(n => `
    <div class="board-row" data-id="${n.id}">
      <div>
        <div class="row-title" data-action="toggle">${escapeHtml(n.title)}</div>
        <div class="row-body">${escapeHtml(n.content)}</div>
      </div>
      <div class="row-meta">${formatDate(n.created_at)} · ${escapeHtml(n.author)}</div>
      <div class="row-actions">
        <button class="btn btn-quiet btn-sm" data-action="edit">수정</button>
        <button class="btn btn-danger btn-sm" data-action="delete">삭제</button>
      </div>
    </div>
  `).join('');
}

noticeListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const row = e.target.closest('.board-row');
  const id = row.dataset.id;
  const action = btn.dataset.action;

  if (action === 'toggle') row.classList.toggle('expanded');
  if (action === 'edit') openForm(notices.find(n => n.id === id));
  if (action === 'delete') deleteNotice(id);
});

function openForm(notice) {
  formPanel.classList.add('open');
  document.getElementById('form-title').textContent = notice ? '공지 수정' : '새 공지 작성';
  document.getElementById('btn-submit').textContent = notice ? '수정 완료' : '등록하기';
  document.getElementById('notice-id').value = notice ? notice.id : '';
  document.getElementById('notice-title').value = notice ? notice.title : '';
  document.getElementById('notice-author').value = notice ? notice.author : '운영진';
  document.getElementById('notice-content').value = notice ? notice.content : '';
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  formPanel.classList.remove('open');
  noticeForm.reset();
  document.getElementById('notice-id').value = '';
}

document.getElementById('btn-new').addEventListener('click', () => openForm(null));
document.getElementById('btn-cancel').addEventListener('click', closeForm);

noticeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('notice-id').value;
  const payload = {
    title: document.getElementById('notice-title').value.trim(),
    author: document.getElementById('notice-author').value.trim(),
    content: document.getElementById('notice-content').value.trim(),
  };

  if (id) {
    payload.updated_at = new Date().toISOString();
    const { error } = await supabaseClient.from('cook_notices').update(payload).eq('id', id);
    if (error) return handleSupabaseError(error, '수정에 실패했어요');
    showToast('공지사항을 수정했어요');
  } else {
    const { error } = await supabaseClient.from('cook_notices').insert(payload);
    if (error) return handleSupabaseError(error, '등록에 실패했어요');
    showToast('공지사항을 등록했어요');
  }

  closeForm();
  loadNotices();
});

async function deleteNotice(id) {
  if (!confirm('이 공지사항을 삭제할까요?')) return;
  const { error } = await supabaseClient.from('cook_notices').delete().eq('id', id);
  if (error) return handleSupabaseError(error, '삭제에 실패했어요');
  showToast('삭제했어요');
  loadNotices();
}

document.addEventListener('DOMContentLoaded', loadNotices);
