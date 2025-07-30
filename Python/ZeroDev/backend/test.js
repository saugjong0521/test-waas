import dotenv from 'dotenv';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import crypto from 'crypto';

dotenv.config();

async function fixedDebugTest() {
  console.log('=== DFNS API 수정된 디버깅 테스트 ===');
  
  try {
    // 1. 서명자 생성 (더 상세한 로그)
    console.log('\n=== 서명자 생성 ===');
    console.log('CRED_ID:', process.env.DFNS_CRED_ID);
    console.log('Private Key 시작:', process.env.DFNS_PRIVATE_KEY.substring(0, 50) + '...');
    
    const signer = new AsymmetricKeySigner({
      privateKey: process.env.DFNS_PRIVATE_KEY,
      credId: process.env.DFNS_CRED_ID
    });
    
    // 2. 서명 테스트
    console.log('\n=== 서명 기능 테스트 ===');
    try {
      const testPayload = { test: 'data' };
      const testChallenge = crypto.randomUUID();
      
      console.log('테스트 서명 중...');
      const signature = await signer.sign({
        challengeIdentifier: testChallenge,
        challenge: JSON.stringify(testPayload)
      });
      console.log('✅ 서명 성공:', signature ? '서명 생성됨' : '서명 없음');
    } catch (signError) {
      console.log('❌ 서명 실패:', signError.message);
      return;
    }
    
    // 3. 클라이언트 생성 및 테스트
    console.log('\n=== DFNS 클라이언트 테스트 ===');
    
    const dfnsClient = new DfnsApiClient({
      authToken: process.env.DFNS_AUTH_TOKEN,
      baseUrl: 'https://api.dfns.ninja',
      signer: signer
    });
    
    console.log('클라이언트 생성 완료');
    
    // 4. 간단한 API 호출 (listWallets)
    console.log('\n=== 지갑 목록 조회 테스트 ===');
    try {
      const wallets = await dfnsClient.wallets.listWallets();
      console.log('✅ 성공! 지갑 개수:', wallets.items ? wallets.items.length : '알 수 없음');
      
      if (wallets.items && wallets.items.length > 0) {
        console.log('첫 번째 지갑 정보:');
        const firstWallet = wallets.items[0];
        console.log('- ID:', firstWallet.id);
        console.log('- Address:', firstWallet.address);
        console.log('- Network:', firstWallet.network);
      }
      
    } catch (apiError) {
      console.log('❌ API 호출 실패:', apiError.message);
      console.log('에러 상세:', apiError);
      
      // 5. 수동 HTTP 요청으로 재시도
      console.log('\n=== 수동 HTTP 요청 재시도 ===');
      try {
        const response = await fetch('https://api.dfns.ninja/wallets', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.DFNS_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('HTTP 응답 상태:', response.status);
        const responseText = await response.text();
        console.log('응답 내용:', responseText);
        
        if (response.ok) {
          const data = JSON.parse(responseText);
          console.log('✅ 수동 요청 성공:', data);
        }
        
      } catch (httpError) {
        console.log('❌ 수동 HTTP 요청도 실패:', httpError.message);
      }
    }
    
    // 6. 다른 API 엔드포인트 테스트
    console.log('\n=== 다른 베이스 URL 테스트 ===');
    try {
      const altClient = new DfnsApiClient({
        authToken: process.env.DFNS_AUTH_TOKEN,
        baseUrl: 'https://api.dfns.io', // 다른 URL 시도
        signer: signer
      });
      
      const altWallets = await altClient.wallets.listWallets();
      console.log('✅ 대체 URL 성공! 지갑 개수:', altWallets.items ? altWallets.items.length : '알 수 없음');
      
    } catch (altError) {
      console.log('❌ 대체 URL 실패:', altError.message);
    }
    
  } catch (error) {
    console.error('전체 테스트 실패:', error);
    console.error('스택 트레이스:', error.stack);
  }
}

// JWT 토큰 분석 함수
function analyzeJWT(token) {
  try {
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('\n=== JWT 토큰 분석 ===');
    console.log('발급자:', payload.iss);
    console.log('대상:', payload.aud);
    console.log('주체:', payload.sub);
    console.log('토큰 종류:', payload['https://custom/app_metadata']?.tokenKind);
    console.log('조직 ID:', payload['https://custom/app_metadata']?.orgId);
    console.log('사용자 ID:', payload['https://custom/app_metadata']?.userId);
    console.log('만료시간:', new Date(payload.exp * 1000).toISOString());
    console.log('현재 유효함:', payload.exp * 1000 > Date.now());
    
  } catch (error) {
    console.log('JWT 분석 실패:', error.message);
  }
}

// 실행
console.log('JWT 토큰 분석부터 시작...');
analyzeJWT(process.env.DFNS_AUTH_TOKEN);

fixedDebugTest();