"use client"
import { X } from "lucide-react"

interface DocumentViewerProps {
  document: any
  onClose: () => void
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(document.file.url)
  const isPdf = /\.pdf$/i.test(document.file.url)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{document.document_type_display}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-140px)] bg-black/5">
          {isImage ? (
            <div className="flex items-center justify-center p-6">
              <img
                src={document.file.url || "/placeholder.svg"}
                alt={document.document_type_display}
                className="max-w-full h-auto"
              />
            </div>
          ) : isPdf ? (
            <iframe src={document.file.url} className="w-full h-[600px]" title={document.document_type_display} />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>Preview not available for this file type</p>
              <p className="text-sm mt-2">Please download to view</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">Document Type: {document.document_type_display}</p>
          <div className="flex gap-3">
            <a
              href={document.file.url}
              download
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Download
            </a>
            <a
              href={document.file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
