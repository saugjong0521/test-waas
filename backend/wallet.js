// dfns 자동화 지갑 구현 (수정됨)
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';

class AutomatedDfnsWallet {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.signer = null;
    this.walletId = null;
  }

  // dfns 클라이언트 초기화
  async initialize() {
    try {
      // 비대칭 키 서명자 설정
      this.signer = new AsymmetricKeySigner({
        privateKey: this.config.privateKey,
        credId: this.config.credentialId
      });

      // API 클라이언트 초기화 (수정된 방식)
      this.client = new DfnsApiClient({
        authToken: this.config.authToken,
        baseUrl: this.config.baseUrl || 'https://api.dfns.ninja',
        signer: this.signer
      });

      console.log('dfns 클라이언트 초기화 완료');
      return true;
    } catch (error) {
      console.error('클라이언트 초기화 실패:', error);
      return false;
    }
  }

  // 지갑 생성
  async createWallet(network = 'EthereumSepolia') {
    try {
      const walletRequest = {
        body: {
          network: network,
          name: `자동화지갑_${Date.now()}`,
          tags: ['automated', 'dfns']
        }
      };

      const response = await this.client.wallets.createWallet(walletRequest);
      this.walletId = response.id;
      
      console.log('지갑 생성 성공:', response);
      return {
        walletId: response.id,
        address: response.address,
        network: response.network
      };
    } catch (error) {
      console.error('지갑 생성 실패:', error);
      throw error;
    }
  }

  // 기존 지갑 조회
  async getWallets() {
    try {
      // 빈 객체 또는 필요한 쿼리 파라미터 전달
      const response = await this.client.wallets.listWallets({});
      return response.items || response;
    } catch (error) {
      console.error('지갑 조회 실패:', error);
      throw error;
    }
  }

  // 지갑 잔액 조회
  async getBalance(walletId) {
    try {
      const response = await this.client.wallets.getWalletAssets({
        walletId: walletId || this.walletId
      });
      
      return response.items.map(asset => ({
        symbol: asset.symbol,
        balance: asset.balance,
        decimals: asset.decimals
      }));
    } catch (error) {
      console.error('잔액 조회 실패:', error);
      throw error;
    }
  }

  // 자동 트랜잭션 전송
  async sendTransaction(toAddress, amount, options = {}) {
    try {
      if (!this.walletId) {
        throw new Error('지갑 ID가 설정되지 않았습니다');
      }

      const transactionRequest = {
        walletId: this.walletId,
        body: {
          kind: 'Transaction',
          to: toAddress,
          value: amount,
          gasLimit: options.gasLimit || '21000',
          gasPrice: options.gasPrice || 'auto',
          note: options.note || '자동화 트랜잭션'
        }
      };

      const response = await this.client.wallets.broadcastTransaction(transactionRequest);
      
      console.log('트랜잭션 전송 성공:', response);
      return {
        txHash: response.txHash,
        status: response.status,
        id: response.id
      };
    } catch (error) {
      console.error('트랜잭션 전송 실패:', error);
      throw error;
    }
  }

  // 스마트 컨트랙트 호출
  async callContract(contractAddress, functionData, options = {}) {
    try {
      const contractRequest = {
        walletId: this.walletId,
        body: {
          kind: 'Transaction',
          to: contractAddress,
          data: functionData,
          value: options.value || '0',
          gasLimit: options.gasLimit || '100000',
          gasPrice: options.gasPrice || 'auto'
        }
      };

      const response = await this.client.wallets.broadcastTransaction(contractRequest);
      return response;
    } catch (error) {
      console.error('컨트랙트 호출 실패:', error);
      throw error;
    }
  }

  // 트랜잭션 상태 확인
  async getTransactionStatus(transactionId) {
    try {
      const response = await this.client.wallets.getTransaction({
        walletId: this.walletId,
        transactionId: transactionId
      });
      
      return {
        status: response.status,
        txHash: response.txHash,
        blockNumber: response.blockNumber,
        gasUsed: response.gasUsed
      };
    } catch (error) {
      console.error('트랜잭션 상태 확인 실패:', error);
      throw error;
    }
  }

  // 자동화 규칙 설정
  async setupAutomation(rules) {
    try {
      // 잔액 모니터링
      if (rules.balanceMonitoring) {
        setInterval(async () => {
          const balance = await this.getBalance();
          const ethBalance = balance.find(b => b.symbol === 'ETH');
          
          if (ethBalance && parseFloat(ethBalance.balance) < rules.minBalance) {
            console.log(`잔액 부족 감지: ${ethBalance.balance} ETH`);
            if (rules.onLowBalance) {
              await rules.onLowBalance(ethBalance);
            }
          }
        }, rules.checkInterval || 60000); // 1분마다 체크
      }

      // 자동 송금
      if (rules.autoSend) {
        setInterval(async () => {
          await this.sendTransaction(
            rules.autoSend.toAddress,
            rules.autoSend.amount,
            rules.autoSend.options
          );
        }, rules.autoSend.interval);
      }

      console.log('자동화 규칙 설정 완료');
    } catch (error) {
      console.error('자동화 설정 실패:', error);
      throw error;
    }
  }

  // 지갑 백업
  async backupWallet() {
    try {
      const walletInfo = await this.client.wallets.getWallet({
        walletId: this.walletId
      });
      
      const backupData = {
        walletId: walletInfo.id,
        address: walletInfo.address,
        network: walletInfo.network,
        createdAt: walletInfo.dateCreated,
        tags: walletInfo.tags
      };

      // 안전한 저장소에 백업 (예: 암호화된 파일)
      return backupData;
    } catch (error) {
      console.error('지갑 백업 실패:', error);
      throw error;
    }
  }
}

// 사용 예제
async function main() {
  // 설정
  const config = {
    authToken: process.env.DFNS_AUTH_TOKEN,
    credentialId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
    orgId: process.env.DFNS_ORG_ID,
    baseUrl: 'https://api.dfns.ninja'
  };

  // 자동화 지갑 인스턴스 생성
  const wallet = new AutomatedDfnsWallet(config);

  try {
    // 1. 클라이언트 초기화
    await wallet.initialize();

    // 2. 지갑 생성 또는 기존 지갑 사용
    const walletInfo = await wallet.createWallet('EthereumSepolia');
    console.log('생성된 지갑:', walletInfo);

    // 3. 잔액 확인
    const balance = await wallet.getBalance();
    console.log('지갑 잔액:', balance);

    // 4. 자동화 규칙 설정
    await wallet.setupAutomation({
      balanceMonitoring: true,
      minBalance: 0.1, // 0.1 ETH 미만시 알림
      checkInterval: 30000, // 30초마다 체크
      onLowBalance: async (balance) => {
        console.log('잔액 부족 알림:', balance);
        // 여기에 알림 로직 추가 (이메일, 슬랙 등)
      },
      autoSend: {
        toAddress: '0x742d35Cc6621C4532c1C6e01d3321E14a0E87EE4',
        amount: '0.01', // 0.01 ETH
        interval: 3600000, // 1시간마다
        options: {
          note: '자동 정기 송금'
        }
      }
    });

    // 5. 수동 트랜잭션 예제
    const txResult = await wallet.sendTransaction(
      '0x742d35Cc6621C4532c1C6e01d3321E14a0E87EE4',
      '0.005',
      {
        note: '테스트 송금',
        gasLimit: '25000'
      }
    );
    console.log('송금 결과:', txResult);

    // 6. 지갑 백업
    const backup = await wallet.backupWallet();
    console.log('백업 데이터:', backup);

  } catch (error) {
    console.error('실행 중 오류:', error);
  }
}

// 환경변수 체크 및 실행
if (process.env.DFNS_AUTH_TOKEN && process.env.DFNS_PRIVATE_KEY) {
  main();
} else {
  console.log('환경변수를 설정해주세요:');
  console.log('DFNS_AUTH_TOKEN, DFNS_CRED_ID, DFNS_PRIVATE_KEY, DFNS_ORG_ID');
}

export { AutomatedDfnsWallet };