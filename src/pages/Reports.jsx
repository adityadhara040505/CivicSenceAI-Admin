import { Card, Button } from '../components/ui'
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react'

const reports = [
  {
    title: 'Monthly User Activity Report',
    description: 'Comprehensive analysis of user engagement and activity',
    date: 'March 2026',
    size: '2.4 MB',
    type: 'PDF'
  },
  {
    title: 'Policy Impact Analysis',
    description: 'Detailed breakdown of policy performance and reach',
    date: 'February 2026',
    size: '3.8 MB',
    type: 'PDF'
  },
  {
    title: 'Scheme Eligibility Report',
    description: 'Statistical analysis of scheme eligibility and applications',
    date: 'February 2026',
    size: '1.9 MB',
    type: 'XLSX'
  },
  {
    title: 'Quarterly Revenue Report',
    description: 'Financial summary and revenue projections',
    date: 'Q4 2025',
    size: '2.1 MB',
    type: 'PDF'
  },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600 mt-1">Download and export system reports</p>
          </div>
          <Button>
            <FileText className="w-4 h-4" />
            Generate New Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {report.date}
                    </span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span className="font-medium">{report.type}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Need a custom report?</h3>
            <p className="text-primary-100">
              Generate custom analytics reports based on specific parameters
            </p>
          </div>
          <Button className="bg-white text-primary-700 hover:bg-primary-50">
            Create Custom Report
          </Button>
        </div>
      </Card>
    </div>
  )
}
