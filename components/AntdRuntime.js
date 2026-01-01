'use client'

import { ConfigProvider } from 'antd'

export default function AntdRuntime({ children }) {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  )
}
