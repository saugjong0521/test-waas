import { PrivyClient } from "@privy-io/server-auth";

// 실제 Privy App ID 및 App Secret 입력
const PRIVY_APP_ID = "cmdig80iv00umjp0j73mz0xww";
const PRIVY_API_KEY = "3FrNXCMtyzNHL9g6hkQ4BtroezjuP855v8XVAAfELgoTcnHQgKxojE9NyhX4wPt6nDjEFYPgXSXyFtyby7oyioQr";

const privy = new PrivyClient(PRIVY_APP_ID, {
  secret: PRIVY_API_KEY,
});

// timeout 감지 유틸
function timeoutPromise(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("⏰ 요청 타임아웃됨 (10초 초과)")), ms);
    }),
  ]);
}

async function testPrivyConnection() {
  try {
    console.log("🔍 Privy 연결 테스트 중...");
    const start = Date.now();

    const users = await timeoutPromise(privy.getUsers({ limit: 1 }), 10000);

    const elapsed = Date.now() - start;
    console.log("✅ Privy 연결 성공! 사용자 수:", users.length);
    console.log("🔹 예시 사용자:", users[0]);
    console.log(`⏱️ 요청 소요 시간: ${elapsed}ms`);
  } catch (error) {
    console.error("❌ Privy 연결 실패!");
    console.error("에러 메시지:", error?.message || error);
  }
}

testPrivyConnection();
