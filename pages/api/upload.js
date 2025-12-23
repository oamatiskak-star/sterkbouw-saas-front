import formidable from "formidable";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("METHOD_NOT_ALLOWED");
  }

  let form;

  try {
    form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true
    });
  } catch (e) {
    return res.status(500).json({ error: "FORM_INIT_FAILED" });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "UPLOAD_FAILED" });
    }

    const projectId = fields?.project_id;
    const workflowKey = fields?.workflow_key || "project_upload";

    if (!projectId) {
      return res.status(400).json({
        error: "PROJECT_ID_REQUIRED"
      });
    }

    const uploadedFiles = [];

    try {
      const fileEntries = Array.isArray(files.file)
        ? files.file
        : Object.values(files);

      for (const file of fileEntries) {
        const fileStream = fs.createReadStream(file.filepath);
        const filePath = `${projectId}/${file.originalFilename}`;

        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, fileStream, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedFiles.push({
          project_id: projectId,
          filename: file.originalFilename,
          path: filePath,
          workflow_key: workflowKey
        });
      }

      if (uploadedFiles.length > 0) {
        await supabase
          .from("project_files")
          .insert(uploadedFiles);

        await supabase
          .from("projects")
          .update({
            files_uploaded: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId);
      }

      return res.status(200).json({
        ok: true,
        files_uploaded: uploadedFiles.length,
        project_id: projectId
      });
    } catch (e) {
      console.error("UPLOAD_ERROR", e);
      return res.status(500).json({
        error: "STORAGE_UPLOAD_FAILED"
      });
    }
  });
}
