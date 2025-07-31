import { useState } from 'react';

export const BalanceCheck = () => {
  const [walletId, setWalletId] = useState('');
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    if (!walletId.trim()) {
      alert('Wallet ID를 입력하세요.');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/wallet/${walletId}/balance?chain=ethereum&asset=eth`
      );
      const data = await res.json();
      if (data.success) {
        setBalance(data.data?.balances?.[0]);
        setError('');
      } else {
        setBalance(null);
        setError(data.error);
      }
    } catch (err) {
      setBalance(null);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>지갑 잔액 조회 (Wallet ID 기반)</h2>
      <input
        type="text"
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
        placeholder="지갑 ID 입력"
        style={{ marginRight: 10 }}
      />
      <button onClick={fetchBalance}>잔액 조회</button>

      {balance && (
        <div style={{ marginTop: 10, color: 'green' }}>
          <p>✅ 체인: {balance.chain}</p>
          <p>✅ ETH 잔액: {balance.display_values?.eth}</p>
          <p>✅ USD 기준: ${balance.display_values?.usd}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>❌ 에러: {error}</p>}
    </div>
  );
};
