import { create } from 'zustand';

interface LoginState {
  id: string;
  setId: (id: string) => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  id: '',
  setId: (id) => set({ id }),
})); 