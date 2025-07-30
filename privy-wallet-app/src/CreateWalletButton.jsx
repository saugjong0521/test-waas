import { useCreateWallet } from '@privy-io/react-auth';

export const CreateWalletButton = () => {
  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('✅ 지갑 생성됨:', wallet);
    },
    onError: (error) => {
      console.error('❌ 지갑 생성 실패:', error);
    },
  });

  return <button onClick={() => createWallet()}>Create Wallet</button>;
};
