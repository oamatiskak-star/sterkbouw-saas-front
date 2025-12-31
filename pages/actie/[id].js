import supabase from "../../lib/supabase"

export default function ActieDetail({
  actieId,
  calculaties,
  documenten,
  planning,
  output
}) {
  return (
    <div>
      <h1>Project / Actie {actieId}</h1>

      <section>
        <h2>Calculaties</h2>
        <pre>{JSON.stringify(calculaties, null, 2)}</pre>
      </section>

      <section>
        <h2>Documenten</h2>
        <pre>{JSON.stringify(documenten, null, 2)}</pre>
      </section>

      <section>
        <h2>Planning</h2>
        <pre>{JSON.stringify(planning, null, 2)}</pre>
      </section>

      <section>
        <h2>Output (live)</h2>
        <pre>{JSON.stringify(output, null, 2)}</pre>
      </section>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const actieId = params.id

  const { data: calculaties } = await supabase
    .from("calculaties")
    .select("*")
    .eq("project_id", actieId)

  const { data: documenten } = await supabase
    .from("documenten")
    .select("*")
    .eq("project_id", actieId)

  const { data: planning } = await supabase
    .from("planning")
    .select("*")
    .eq("project_id", actieId)

  const { data: output } = await supabase
    .from("builder_results")
    .select("*")
    .eq("project_id", actieId)
    .order("created_at", { ascending: false })

  return {
    props: {
      actieId,
      calculaties: calculaties || [],
      documenten: documenten || [],
      planning: planning || [],
      output: output || []
    }
  }
}
