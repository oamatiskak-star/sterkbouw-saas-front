// components/Layout/AdminLayout.tsx
import { ReactNode } from 'react';
import { Layout, Menu } from 'antd';
import { 
  HomeOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard')
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      onClick: () => router.push('/projects')
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Klanten',
      onClick: () => router.push('/clients')
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: 'Documenten',
      onClick: () => router.push('/documents')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      onClick: () => router.push('/settings')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Sterkbouw Admin
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[router.pathname.split('/')[1] || 'dashboard']}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>Project Portaal</div>
            <div>Welkom, Gebruiker</div>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
