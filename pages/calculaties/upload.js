async function upload() {
  setBusy(true)
  setErr(null)

  // Controleer of project_id gedefinieerd is voordat we verder gaan
  if (!projectId) {
    setErr("Project ID ontbreekt!")
    setBusy(false)
    return
  }

  console.log("Project ID:", projectId) // Debugging: controleer projectId

  try {
    if (files.length === 0) {
      throw new Error("Geen bestanden geselecteerd")
    }

    console.log("Bestanden geselecteerd:", files) // Debugging: controleer geselecteerde bestanden

    for (const file of files) {
      const path = `${projectId}/${Date.now()}_${file.name}`

      console.log("Path voor bestand:", path) // Debugging: controleer bestandspad

      // Gebruik GET in plaats van POST voor signed upload URL
      const r = await fetch(`/api/signed-upload?project_id=${projectId}&path=${path}&contentType=${file.type}`, {
        method: "GET", // Gebruik GET-methode
      })

      if (!r.ok) {
        throw new Error("Signed upload URL ophalen mislukt")
      }

      const { signedUrl } = await r.json()

      console.log("Signed URL ontvangen:", signedUrl) // Debugging: controleer signed URL

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "false"
        },
        body: file
      })

      if (!uploadRes.ok) {
        throw new Error("Upload naar storage mislukt")
      }

      const { error: insertError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          file_name: file.name,
          storage_path: path,
          status: "uploaded",
          created_at: new Date().toISOString()
        })

      if (insertError) {
        throw new Error("DB insert mislukt: " + insertError.message)
      }
    }

    const { error: taskError } = await supabase
      .from("executor_tasks")
      .insert({
        action: "upload_files",
        project_id: projectId,
        status: "open",
        assigned_to: "executor"
      })

    if (taskError) {
      throw new Error("Executor taak mislukt: " + taskError.message)
    }

    console.log("Bestanden succesvol geüpload") // Debugging: controleer succes

    // Router naar nieuw project
    router.push(`/calculaties/nieuw?project_id=${projectId}`)
  } catch (e) {
    console.error("Fout bij uploaden:", e) // Debugging: log de fout
    setErr(e.message)
  } finally {
    setBusy(false)
  }
}
