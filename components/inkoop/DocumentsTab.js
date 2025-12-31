export default function DocumentsTab({ 
  documents, selectedDocuments, setSelectedDocuments, 
  fileInputRef, handleUploadDocument, loading 
}) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-files text-primary me-2"></i>
        Document Management
      </h5>
      <div className="alert alert-info">
        <i className="ti ti-info-circle me-2"></i>
        Document upload en management
      </div>
    </div>
  )
}
