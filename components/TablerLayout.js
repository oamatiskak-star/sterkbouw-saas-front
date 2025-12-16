import TablerNav from "./TablerNav"

export default function TablerLayout({ children }) {
  return (
    <div className="page">
      <TablerNav />

      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
