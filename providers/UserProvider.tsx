'use client';

// 导入自定义的useUser钩子
import { MyUserContextProvider } from '@/hooks/useUser';

// 定义UserProvider组件的props接口
interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  return <MyUserContextProvider>{children}</MyUserContextProvider>;
};

export default UserProvider;
