import { usePrivy, useLogin } from '@privy-io/react-auth';
import { CustomWalletGenerator } from './CustomWalletGenerator';
import { BalanceCheck } from './BalanceCheck';
import { SendTransaction } from './SendTransaction';

function App() {
  const { ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();

  if (!ready) return <p>Loading...</p>;

  return (
    <div>
      <CustomWalletGenerator />
      <BalanceCheck />
      <SendTransaction />
    </div>
  );
}

export default App;
