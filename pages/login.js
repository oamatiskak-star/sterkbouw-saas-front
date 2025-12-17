export default function Login() {
  return (
    <div className="page page-center">
      <div className="container-tight py-4">
        <div className="text-center mb-4">
          <h1>SterkBouw SaaS</h1>
        </div>

        <form className="card card-md">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">
              Inloggen
            </h2>

            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-control" />
            </div>

            <div className="mb-2">
              <label className="form-label">Wachtwoord</label>
              <input type="password" className="form-control" />
            </div>

            <div className="form-footer">
              <button className="btn btn-primary w-100">
                Inloggen
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
