
import { createClient } from '@supabase/supabase-js';

// 실제 서비스 시에는 환경 변수를 사용하세요.
const supabaseUrl = 'https://msoiyslijsdkdgxfgnms.supabase.co';
const supabaseAnonKey = 'sb_publishable_9Rggdl0u0SgzgCDgSBRvrA_JKaaL7mh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Storage에 파일을 업로드하고 공용 URL을 반환합니다.
 * 'report-assets' 버킷이 생성되어 있고 public 권한이 있어야 합니다.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('report-assets')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('report-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
