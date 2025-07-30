// CustomWalletGenerator.jsx
import { useState } from 'react';

export const CustomWalletGenerator = () => {
  const [customId, setCustomId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const generateWallet = async () => {
    if (!customId.trim()) {
      alert('Custom ID를 입력하세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/create-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customUserId: customId }),
      });
      const data = await res.json();
      if (data.success) {
        setWalletAddress(data.address);
        setError('');
      } else {
        setWalletAddress('');
        setError(data.error);
      }
    } catch (err) {
      setWalletAddress('');
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Custom ID로 Embedded Wallet 생성</h2>
      <input
        type="text"
        value={customId}
        onChange={(e) => setCustomId(e.target.value)}
        placeholder="예: user-123"
        style={{ marginRight: 10 }}
      />
      <button onClick={generateWallet}>지갑 생성</button>

      {walletAddress && (
        <p style={{ color: 'green' }}>✅ 생성된 주소: {walletAddress}</p>
      )}
      {error && <p style={{ color: 'red' }}>❌ 에러: {error}</p>}
    </div>
  );
};
