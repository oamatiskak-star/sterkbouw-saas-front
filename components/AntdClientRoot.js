'use client'

import { ConfigProvider } from 'antd'
import nlNL from 'antd/locale/nl_NL'

export default function AntdClientRoot({ children }) {
  return (
    <ConfigProvider locale={nlNL}>
      {children}
    </ConfigProvider>
  )
}
