const { createClient } = require('@supabase/supabase-js')

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 연결 테스트
const testConnection = async () => {
    try {
        // crop_logs 테이블 데이터 확인
        const { data, error } = await supabase
            .from('crop_diary')
            .select('*')
            .limit(1);
            
        if (error) throw error;
        
        console.log('Supabase 연결 성공!');
        console.log('Sample data:', data);
    } catch (error) {
        console.error('Supabase 연결 실패:', error.message);
    }
};

console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);

testConnection();

module.exports = supabase;
