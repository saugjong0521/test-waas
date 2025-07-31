import { useState } from 'react';

export const SendTransaction = () => {
  const [walletId, setWalletId] = useState('');
  const [to, setTo] = useState('');
  const [valueEth, setValueEth] = useState('');
  const [chainId, setChainId] = useState('11155111');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const sendTransaction = async () => {
    if (!walletId || !to || !valueEth || !chainId) {
      alert('모든 입력값을 채워주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId,
          to,
          valueEth,
          chainId: parseInt(chainId),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTxHash(data.tx?.data?.hash || '');
        setError('');
      } else {
        setTxHash('');
        setError(data.error || '전송 실패');
      }
    } catch (err) {
      setTxHash('');
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>ETH 전송 (Privy Embedded Wallet)</h2>

      <input
        type="text"
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
        placeholder="지갑 ID 입력"
        style={{ marginBottom: 10, display: 'block', width: 400 }}
      />
      <input
        type="text"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="수신자 지갑 주소"
        style={{ marginBottom: 10, display: 'block', width: 400 }}
      />
      <input
        type="text"
        value={valueEth}
        onChange={(e) => setValueEth(e.target.value)}
        placeholder="보낼 ETH 수량 (예: 0.01)"
        style={{ marginBottom: 10, display: 'block', width: 400 }}
      />
      <input
        type="text"
        value={chainId}
        onChange={(e) => setChainId(e.target.value)}
        placeholder="Chain ID (예: 11155111)"
        style={{ marginBottom: 10, display: 'block', width: 400 }}
      />
      <button onClick={sendTransaction}>전송 요청</button>

      {txHash && (
        <p style={{ marginTop: 10, color: 'green' }}>
          ✅ 전송 성공! Tx Hash: <br />
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}
      {error && <p style={{ color: 'red' }}>❌ 에러: {error}</p>}
    </div>
  );
};
