// ============================================================
// Supabase 클라이언트 초기화
// 이 파일을 쓰는 페이지는 반드시 그 전에
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// 를 먼저 불러와야 합니다.
// ============================================================
const SUPABASE_URL = 'https://nqncnodjgssbjoghenle.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KVaeTPnvy2deyWIs0d5c7Q_5om8cjPS';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
