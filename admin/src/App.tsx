import React, { useState, Suspense } from 'react'
import { DashboardLayout } from './components/layout'
import { KPICard, StatCard, Metric } from './components/kpi'
import { Alert, ToastContainer, useToast, StatusBadge } from './components/alerts'
import { DollarSign, Users, ShoppingBag, TrendingUp, Info, Search, Plus, Moon, Sun, Download, Filter } from 'lucide-react'
import { useServiceWorker } from './hooks/useServiceWorker'
import { useDarkMode } from './hooks/useDarkMode'
import { LazyChartWrapper } from './components/ui/LazyChart'
import {
  DataTable, Modal, SearchInput, Tooltip, ErrorBoundary,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Select,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  ProgressBar
} from './components/ui'

// Initialize service worker
useServiceWorker()

// Lazy load charts for code splitting
const SimpleLineChart = React.lazy(() => import('./components/charts/LineChart').then(m => ({ default: m.SimpleLineChart })))
const SimpleBarChart = React.lazy(() => import('./components/charts/BarChart').then(m => ({ default: m.SimpleBarChart })))
const SimplePieChart = React.lazy(() => import('./components/charts/PieChart').then(m => ({ default: m.SimplePieChart })))
const SimpleAreaChart = React.lazy(() => import('./components/charts/AreaChart').then(m => ({ default: m.SimpleAreaChart })))

// Sample data for charts
const revenueData = [
  { name: 'T1', value: 4000 },
  { name: 'T2', value: 3000 },
  { name: 'T3', value: 5000 },
  { name: 'T4', value: 4500 },
  { name: 'T5', value: 6000 },
  { name: 'T6', value: 5500 }
]

const campaignData = [
  { name: 'Google Ads', clicks: 4000, impressions: 2400, conversions: 240 },
  { name: 'Facebook', clicks: 3000, impressions: 1398, conversions: 221 },
  { name: 'TikTok', clicks: 2000, impressions: 9800, conversions: 229 },
  { name: 'Email', clicks: 2780, impressions: 3908, conversions: 200 }
]

const trafficSourceData = [
  { name: 'Organic', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Social', value: 300 },
  { name: 'Referral', value: 200 }
]

function App() {
  const { toasts, toast, ToastContainer, dismissToast } = useToast()
  const { theme, toggleTheme, isDark } = useDarkMode()
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const handleTestToast = () => {
    toast.success('Dashboard đã được cập nhật thành công!')
  }

  // Sample data for DataTable
  const campaignDataList = [
    { id: '1', name: 'Google Ads Q1', status: 'active', budget: '$5,000', spent: '$3,500', conversions: 240 },
    { id: '2', name: 'Facebook Spring Sale', status: 'pending', budget: '$3,000', spent: '$0', conversions: 0 },
    { id: '3', name: 'TikTok Influencer', status: 'active', budget: '$2,000', spent: '$1,800', conversions: 229 },
    { id: '4', name: 'Email Marketing', status: 'inactive', budget: '$1,000', spent: '$950', conversions: 200 },
    { id: '5', name: 'SEO Content', status: 'active', budget: '$4,000', spent: '$2,800', conversions: 156 }
  ]

  const filteredData = campaignDataList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: 'name', title: 'Chiến dịch', sortable: true },
    {
      key: 'status',
      title: 'Trạng thái',
      sortable: true,
      render: (item: typeof campaignDataList[0]) => (
        <StatusBadge
          variant={item.status as 'active' | 'pending' | 'inactive'}
        />
      )
    },
    { key: 'budget', title: 'Ngân sách', sortable: true },
    { key: 'spent', title: 'Đã chi', sortable: true },
    { key: 'conversions', title: 'Chuyển đổi', sortable: true }
  ]

  return (
    <DashboardLayout>
      <ToastContainer />

      {/* Welcome Alert */}
      {!alertDismissed && (
        <Alert
          variant="info"
          title="Chào mừng đến với SaDec Marketing Hub"
          dismissible
          onDismiss={() => setAlertDismissed(true)}
          className="mb-6"
        >
          Dashboard quản lý marketing toàn diện - Theo dõi hiệu suất chiến dịch và phân tích dữ liệu
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Tổng quan hiệu suất marketing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleTestToast} className="btn-outline">
            Test Toast
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Doanh thu"
          value="₫128,500,000"
          previousValue="₫102,000,000"
          change={26.0}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KPICard
          title="Khách hàng"
          value="2,543"
          previousValue="2,100"
          change={21.1}
          icon={<Users className="w-5 h-5" />}
        />
        <KPICard
          title="Đơn hàng"
          value="1,234"
          previousValue="1,100"
          change={12.2}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <KPICard
          title="Tỷ lệ chuyển đổi"
          value="3.24%"
          previousValue="2.80%"
          change={15.7}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Lượt xem trang"
          value="45,231"
          subtitle="+12% so với tuần trước"
          progress={75}
          variant="primary"
        />
        <StatCard
          label="Tỷ lệ thoát"
          value="42.3%"
          subtitle="-5% so với tuần trước"
          progress={42}
          variant="success"
        />
        <StatCard
          label="Thời gian trên trang"
          value="4:32"
          subtitle="+30s so với tuần trước"
          progress={65}
          variant="warning"
        />
      </div>

      {/* Metrics with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric
          label="CTR trung bình"
          value="2.4%"
          sparkline={[2.1, 2.3, 2.2, 2.5, 2.4, 2.6, 2.4]}
        />
        <Metric
          label="CPA"
          value="₫45,000"
          unit="/đơn"
          sparkline={[52, 48, 47, 46, 45, 44, 45]}
        />
        <Metric
          label="ROAS"
          value="4.2x"
          sparkline={[3.5, 3.8, 4.0, 3.9, 4.1, 4.3, 4.2]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LazyChartWrapper>
          <SimpleLineChart
            title="Doanh thu theo tháng"
            data={revenueData}
            dataKey="name"
            height={250}
          />
        </LazyChartWrapper>
        <LazyChartWrapper>
          <SimplePieChart
            title="Nguồn traffic"
            data={trafficSourceData}
            height={250}
            innerRadius={60}
          />
        </LazyChartWrapper>
      </div>

      {/* Bar Chart Full Width */}
      <LazyChartWrapper>
        <SimpleBarChart
          title="Hiệu suất chiến dịch"
          data={campaignData}
          dataKeys={['clicks', 'impressions', 'conversions']}
          height={300}
          className="mb-6"
        />
      </LazyChartWrapper>

      {/* Area Chart */}
      <LazyChartWrapper>
        <SimpleAreaChart
          title="Lượt truy cập theo thời gian"
          data={revenueData}
          dataKey="value"
          height={250}
          className="mb-6"
        />
      </LazyChartWrapper>

      {/* Status Badges Demo */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái chiến dịch</h3>
        <div className="flex flex-wrap gap-4">
          <StatusBadge variant="active" />
          <StatusBadge variant="pending" />
          <StatusBadge variant="warning" />
          <StatusBadge variant="error" />
          <StatusBadge variant="inactive" />
        </div>
      </div>

      {/* Alerts Demo */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Cảnh báo hệ thống</h3>
        <Alert variant="success" title="Thành công" showIcon>
          Chiến dịch đã được kích hoạt thành công
        </Alert>
        <Alert variant="warning" title="Cảnh báo" showIcon>
          Ngân sách chiến dịch sắp hết (80% đã sử dụng)
        </Alert>
        <Alert variant="error" title="Lỗi" showIcon>
          Không thể kết nối API - Vui lòng thử lại sau
        </Alert>
      </div>

      {/* New Features Demo */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Tooltip content="DataTable với sorting, pagination, selection">
            <span className="flex items-center gap-2">
              Features Mới
              <Info className="w-4 h-4 text-gray-400" />
            </span>
          </Tooltip>
        </h3>

        {/* Search Input */}
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm chiến dịch..."
            className="max-w-md"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredData}
          columns={columns}
          selectable
          selectedKeys={selectedRows}
          onSelectionChange={setSelectedRows}
          pageSize={3}
        />

        {selectedRows.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              Đã chọn {selectedRows.length} chiến dịch
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo chiến dịch mới"
        description="Điền thông tin chiến dịch mới của bạn"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-outline"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                toast.success('Chiến dịch đã được tạo!')
                setIsModalOpen(false)
              }}
              className="btn-primary"
            >
              Tạo chiến dịch
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chiến dịch
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nhập tên chiến dịch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngân sách
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="$5,000"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default App
