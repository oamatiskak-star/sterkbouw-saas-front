import MobileLayout from "../components/MobileLayout"

export default function Taken() {
  return (
    <MobileLayout>
      <h1>Taken vandaag</h1>

      <ul>
        <li>✔ Fundering controleren</li>
        <li>⬜ Sparingen nameten</li>
        <li>⬜ Foto uploaden badkamer</li>
      </ul>

      <button className="primary">
        ➕ Nieuwe taak
      </button>

      <style jsx>{`
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          background: #fff;
          padding: 16px;
          margin-bottom: 8px;
          border-radius: 10px;
        }
        .primary {
          width: 100%;
          height: 56px;
          background: #111;
          color: #fff;
          font-size: 18px;
          border-radius: 12px;
          border: none;
        }
      `}</style>
    </MobileLayout>
  )
}
