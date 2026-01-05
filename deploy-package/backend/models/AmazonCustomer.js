import mongoose from 'mongoose'

const amazonCustomerSchema = new mongoose.Schema({
  // Excel中的ID（第一列）
  excelId: {
    type: String,
    default: '',
    trim: true,
    index: true,
    comment: 'Excel中的ID'
  },
  // 亚马逊客户管理的字段
  source: {
    type: String,
    default: '',
    trim: true,
    comment: '来源'
  },
  keyword: {
    type: String,
    default: '',
    trim: true,
    comment: '关键词'
  },
  companyName: {
    type: String,
    default: '',
    trim: true,
    comment: '公司名称'
  },
  storeName: {
    type: String,
    default: '',
    trim: true,
    comment: '商店名称'
  },
  storeLink: {
    type: String,
    default: '',
    trim: true,
    comment: '店铺链接'
  },
  contactPerson: {
    type: String,
    default: '',
    trim: true,
    comment: '联系人'
  },
  contactMethod: {
    type: String,
    default: '',
    trim: true,
    comment: '联系方式'
  },
  address: {
    type: String,
    default: '',
    trim: true,
    comment: '地址'
  },
  // 额外字段
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
    index: true,
    comment: '合作状态'
  },
  remark: {
    type: String,
    default: '',
    comment: '备注'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    comment: '创建者ID'
  },
  excelRowIndex: {
    type: Number,
    comment: 'Excel原始行号（用于追踪）'
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'amazon_customers' // 指定集合名称
})

// 创建索引以提高查询性能
amazonCustomerSchema.index({ companyName: 1 })
amazonCustomerSchema.index({ storeName: 1 })
amazonCustomerSchema.index({ contactMethod: 1 })
amazonCustomerSchema.index({ createdAt: -1 })
amazonCustomerSchema.index({ createdBy: 1 })

const AmazonCustomer = mongoose.model('AmazonCustomer', amazonCustomerSchema)

export default AmazonCustomer
