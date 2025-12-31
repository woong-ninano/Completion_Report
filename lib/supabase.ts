
import { createClient } from '@supabase/supabase-js';

// 주의: 실제 서비스 시에는 환경 변수(process.env)를 사용하세요.
const supabaseUrl = 'https://msoiyslijsdkdgxfgnms.supabase.co';
const supabaseAnonKey = 'sb_publishable_9Rggdl0u0SgzgCDgSBRvrA_JKaaL7mh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
