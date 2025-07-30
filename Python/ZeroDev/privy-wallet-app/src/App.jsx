import { usePrivy, useLogin } from '@privy-io/react-auth';
import { CreateWalletButton } from './CreateWalletButton';
import { CustomWalletGenerator } from './CustomWalletGenerator';

function App() {
  const { ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();

  if (!ready) return <p>Loading...</p>;

  return (
    <div>
      {!authenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <>
          <p>✅ Logged in</p>
          <CreateWalletButton />
          <button onClick={logout}>Logout</button>
        </>
      )}
      
      <CustomWalletGenerator />
    </div>
  );
}

export default App;
