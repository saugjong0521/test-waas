import dotenv from 'dotenv';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';

dotenv.config();

async function debugTest() {
  console.log('=== DFNS API 디버깅 테스트 ===');
  
  try {
    // 1. 환경변수 확인
    console.log('환경변수 확인:');
    console.log('- AUTH_TOKEN:', process.env.DFNS_AUTH_TOKEN ? '존재' : '없음');
    console.log('- CRED_ID:', process.env.DFNS_CRED_ID ? '존재' : '없음');
    console.log('- PRIVATE_KEY:', process.env.DFNS_PRIVATE_KEY ? '존재' : '없음');
    console.log('- ORG_ID:', process.env.DFNS_ORG_ID);
    
    // 2. Signer 생성 테스트
    console.log('\n=== Signer 생성 테스트 ===');
    const signer = new AsymmetricKeySigner({
      privateKey: process.env.DFNS_PRIVATE_KEY,
      credId: process.env.DFNS_CRED_ID
    });
    console.log('✅ Signer 생성 성공');
    
    // 3. 클라이언트 생성 테스트 (여러 방식 시도)
    console.log('\n=== 클라이언트 생성 테스트 ===');
    
    // 방식 1: 기본 방식
    try {
      const client1 = new DfnsApiClient({
        authToken: process.env.DFNS_AUTH_TOKEN,
        baseUrl: 'https://api.dfns.ninja',
        signer: signer
      });
      console.log('✅ 클라이언트 생성 성공 (방식 1)');
      
      // 간단한 API 호출 테스트
      console.log('\n=== API 호출 테스트 (방식 1) ===');
      const response1 = await client1.wallets.listWallets();
      console.log('✅ 지갑 목록 조회 성공:', response1.items?.length || 0, '개');
      
    } catch (error) {
      console.log('❌ 방식 1 실패:', error.message);
    }
    
    // 방식 2: appId 없이 orgId 포함
    try {
      const client2 = new DfnsApiClient({
        authToken: process.env.DFNS_AUTH_TOKEN,
        baseUrl: 'https://api.dfns.ninja',
        signer: signer,
        orgId: process.env.DFNS_ORG_ID
      });
      console.log('✅ 클라이언트 생성 성공 (방식 2 - orgId 포함)');
      
      console.log('\n=== API 호출 테스트 (방식 2) ===');
      const response2 = await client2.wallets.listWallets();
      console.log('✅ 지갑 목록 조회 성공:', response2.items?.length || 0, '개');
      
    } catch (error) {
      console.log('❌ 방식 2 실패:', error.message);
    }
    
    // 방식 3: 빈 파라미터로 호출
    try {
      const client3 = new DfnsApiClient({
        authToken: process.env.DFNS_AUTH_TOKEN,
        baseUrl: 'https://api.dfns.ninja',
        signer: signer
      });
      
      console.log('\n=== API 호출 테스트 (방식 3 - 빈 파라미터) ===');
      const response3 = await client3.wallets.listWallets({});
      console.log('✅ 지갑 목록 조회 성공:', response3.items?.length || 0, '개');
      
    } catch (error) {
      console.log('❌ 방식 3 실패:', error.message);
    }
    
    // 방식 4: 직접 fetch로 테스트
    console.log('\n=== 직접 HTTP 요청 테스트 ===');
    try {
      const response = await fetch('https://api.dfns.ninja/wallets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.DFNS_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'X-DFNS-USERACTION': await signer.sign({
            kind: 'userAction',
            userActionChallengeId: 'test',
            userActionPayload: JSON.stringify({})
          })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 직접 HTTP 요청 성공:', data);
      } else {
        const errorData = await response.text();
        console.log('❌ 직접 HTTP 요청 실패:', response.status, errorData);
      }
    } catch (error) {
      console.log('❌ 직접 HTTP 요청 오류:', error.message);
    }
    
  } catch (error) {
    console.error('전체 테스트 실패:', error);
  }
}

debugTest();