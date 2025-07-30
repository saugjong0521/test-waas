import dotenv from 'dotenv';
import { AutomatedDfnsWallet } from './wallet.js';

dotenv.config();

async function run() {
  const config = {
    authToken: process.env.DFNS_AUTH_TOKEN,
    credentialId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
    orgId: process.env.DFNS_ORG_ID
  };

  const wallet = new AutomatedDfnsWallet(config);
  
  try {
    console.log('dfns 지갑 초기화 중...');
    await wallet.initialize();
    
    console.log('기존 지갑 조회 중...');
    const wallets = await wallet.getWallets();
    console.log('보유 지갑:', wallets.length, '개');
    
    if (wallets.length > 0) {
      wallet.walletId = wallets[0].id;
      console.log('첫 번째 지갑 사용:', wallets[0].address);
      
      const balance = await wallet.getBalance();
      console.log('지갑 잔액:', balance);
    } else {
      console.log('새 지갑 생성 중...');
      const newWallet = await wallet.createWallet();
      console.log('새 지갑 생성됨:', newWallet);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

run();