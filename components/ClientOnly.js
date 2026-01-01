import dynamic from 'next/dynamic'

export default dynamic(
  () => Promise.resolve(({ children }) => children),
  { ssr: false }
)
