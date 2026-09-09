const recipeListEl = document.getElementById('recipe-list');
const rFormPanel = document.getElementById('form-panel');
const recipeForm = document.getElementById('recipe-form');
let recipes = [];
let activeCategory = '전체';

function categoryChipClass(cat) {
  if (cat === '메인') return 'herb';
  if (cat === '디저트') return 'marigold';
  return '';
}

async function loadRecipes() {
  recipeListEl.innerHTML = '<div class="card"><p>불러오는 중…</p></div>';
  const { data, error } = await supabaseClient
    .from('cook_recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, '레시피를 불러오지 못했어요');
    recipeListEl.innerHTML = '<div class="card"><p>불러오기에 실패했어요. 새로고침 해보세요.</p></div>';
    return;
  }

  recipes = data || [];
  renderRecipes();
}

function renderRecipes() {
  const filtered = activeCategory === '전체'
    ? recipes
    : recipes.filter(r => r.category === activeCategory);

  if (filtered.length === 0) {
    recipeListEl.innerHTML = '<div class="card"><p>해당 카테고리에 등록된 레시피가 없어요.</p></div>';
    return;
  }

  recipeListEl.innerHTML = filtered.map(r => `
    <div class="card" data-id="${r.id}">
      <span class="chip ${categoryChipClass(r.category)}">${escapeHtml(r.category)}</span>
      <h3 class="row-title" data-action="toggle" style="cursor:pointer;">${escapeHtml(r.title)}</h3>
      <div class="meta">${formatDate(r.created_at)} · by ${escapeHtml(r.author)}</div>
      <p class="recipe-body" style="display:none; white-space:pre-wrap;">${escapeHtml(r.content)}</p>
      <div class="row-actions" style="margin-top:10px;">
        <button class="btn btn-quiet btn-sm" data-action="edit">수정</button>
        <button class="btn btn-danger btn-sm" data-action="delete">삭제</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('category-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  document.querySelectorAll('#category-filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.category;
  renderRecipes();
});

recipeListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = e.target.closest('.card');
  const id = card.dataset.id;
  const action = btn.dataset.action;

  if (action === 'toggle') {
    const body = card.querySelector('.recipe-body');
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }
  if (action === 'edit') openForm(recipes.find(r => r.id === id));
  if (action === 'delete') deleteRecipe(id);
});

function openForm(recipe) {
  rFormPanel.classList.add('open');
  document.getElementById('form-title').textContent = recipe ? '레시피 수정' : '새 레시피 작성';
  document.getElementById('btn-submit').textContent = recipe ? '수정 완료' : '등록하기';
  document.getElementById('recipe-id').value = recipe ? recipe.id : '';
  document.getElementById('recipe-title').value = recipe ? recipe.title : '';
  document.getElementById('recipe-category').value = recipe ? recipe.category : '메인';
  document.getElementById('recipe-author').value = recipe ? recipe.author : '';
  document.getElementById('recipe-content').value = recipe ? recipe.content : '';
  rFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  rFormPanel.classList.remove('open');
  recipeForm.reset();
  document.getElementById('recipe-id').value = '';
}

document.getElementById('btn-new').addEventListener('click', () => openForm(null));
document.getElementById('btn-cancel').addEventListener('click', closeForm);

recipeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('recipe-id').value;
  const payload = {
    title: document.getElementById('recipe-title').value.trim(),
    category: document.getElementById('recipe-category').value,
    author: document.getElementById('recipe-author').value.trim(),
    content: document.getElementById('recipe-content').value.trim(),
  };

  if (id) {
    payload.updated_at = new Date().toISOString();
    const { error } = await supabaseClient.from('cook_recipes').update(payload).eq('id', id);
    if (error) return handleSupabaseError(error, '수정에 실패했어요');
    showToast('레시피를 수정했어요');
  } else {
    const { error } = await supabaseClient.from('cook_recipes').insert(payload);
    if (error) return handleSupabaseError(error, '등록에 실패했어요');
    showToast('레시피를 등록했어요');
  }

  closeForm();
  loadRecipes();
});

async function deleteRecipe(id) {
  if (!confirm('이 레시피를 삭제할까요?')) return;
  const { error } = await supabaseClient.from('cook_recipes').delete().eq('id', id);
  if (error) return handleSupabaseError(error, '삭제에 실패했어요');
  showToast('삭제했어요');
  loadRecipes();
}

document.addEventListener('DOMContentLoaded', loadRecipes);
