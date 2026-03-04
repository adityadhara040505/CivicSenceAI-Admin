import { useState } from 'react'
import { Card, Input, Select, Button } from '../components/ui'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { policyAPI } from '../services/api'

const policyCategories = [
  { value: '', label: 'Select Category' },
  { value: 'Budget', label: 'Budget' },
  { value: 'Tax', label: 'Tax' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'MSME', label: 'MSME' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Education', label: 'Education' },
  { value: 'Sustainability', label: 'Sustainability' },
]

export default function UploadPolicy() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  })
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title || !formData.category || !file) {
      setError('Please fill all required fields and select a file')
      return
    }

    setUploading(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('description', formData.description)

      const result = await policyAPI.create(uploadFormData)
      
      if (result.success) {
        setUploadSuccess(true)
        setTimeout(() => {
          setUploadSuccess(false)
          setFile(null)
          setFormData({ title: '', category: '', description: '' })
        }, 3000)
      } else {
        setError(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {uploadSuccess && (
        <Card className="mb-6 bg-green-50 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Upload Successful!</h3>
              <p className="text-sm text-green-700">Your policy has been uploaded and is being analyzed.</p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-6 bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Upload Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Upload New Policy Document</h2>
          <p className="text-gray-600 mt-2">
            Upload policy documents to analyze and make them available for users
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Policy Title */}
          <Input
            label="Policy Title *"
            name="title"
            placeholder="Enter policy title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          {/* Policy Category */}
          <Select
            label="Policy Category *"
            name="category"
            options={policyCategories}
            value={formData.category}
            onChange={handleInputChange}
            required
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Add a brief description of the policy..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF Document *
            </label>
            
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your PDF file here, or browse
                </h3>
                <p className="text-sm text-gray-500">
                  Supports: PDF files up to 50MB
                </p>
              </div>
            ) : (
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Processing Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Once uploaded, the policy will be analyzed by our AI system to extract key insights, 
                eligibility criteria, and generate simulation scenarios. This typically takes 2-5 minutes.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              size="lg"
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Analyze
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              size="lg"
              onClick={() => {
                setFile(null)
                setFormData({ title: '', category: '', description: '' })
              }}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </Card>

      {/* Recent Uploads */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
        <div className="space-y-3">
          {[
            { name: 'Budget 2026 - Tax Reform', date: '2 hours ago', status: 'Processed' },
            { name: 'MSME Credit Guarantee', date: '5 hours ago', status: 'Processed' },
            { name: 'Green Energy Subsidy', date: '1 day ago', status: 'Processed' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
