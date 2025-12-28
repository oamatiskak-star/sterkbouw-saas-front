// components/dashboard/file-uploader.tsx
import { Upload, FileText, X } from "lucide-react"
import { useState } from "react"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSizeMB?: number
}

export function FileUploader({ 
  onFilesSelected, 
  accept = ".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.cad",
  maxFiles = 10,
  maxSizeMB = 50
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validatie
    if (selectedFiles.length > maxFiles) {
      setError(`Maximaal ${maxFiles} bestanden toegestaan`)
      return
    }

    const oversized = selectedFiles.find(f => f.size > maxSizeMB * 1024 * 1024)
    if (oversized) {
      setError(`Bestand ${oversized.name} is te groot (max ${maxSizeMB}MB)`)
      return
    }

    setFiles(selectedFiles)
    setError("")
    onFilesSelected(selectedFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Sleep bouwdocumenten hier
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            PDF, CAD, afbeeldingen, Word • Max {maxSizeMB}MB per bestand
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Selecteer bestanden
          </div>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Geselecteerde bestanden ({files.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
