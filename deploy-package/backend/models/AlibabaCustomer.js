import mongoose from 'mongoose'

const alibabaCustomerSchema = new mongoose.Schema({
  // Excel中的ID（第一列）
  excelId: {
    type: String,
    default: '',
    trim: true,
    index: true,
    comment: 'Excel中的ID'
  },
  // Excel固定表头的15个字段
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
    comment: '公司名'
  },
  storeLink: {
    type: String,
    default: '',
    trim: true,
    comment: '店铺链接'
  },
  yearsInBusiness: {
    type: String,
    default: '',
    trim: true,
    comment: '入驻年数'
  },
  mainProducts: {
    type: String,
    default: '',
    trim: true,
    comment: '主营产品'
  },
  sales: {
    type: String,
    default: '',
    trim: true,
    comment: '销量'
  },
  salesVolume: {
    type: String,
    default: '',
    trim: true,
    comment: '销售额'
  },
  hotMarket: {
    type: String,
    default: '',
    trim: true,
    comment: '热销市场'
  },
  country: {
    type: String,
    default: '',
    trim: true,
    comment: '国家'
  },
  province: {
    type: String,
    default: '',
    trim: true,
    comment: '省份'
  },
  city: {
    type: String,
    default: '',
    trim: true,
    comment: '城市'
  },
  contactPerson: {
    type: String,
    default: '',
    trim: true,
    comment: '联系人'
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    comment: '电话'
  },
  mobile: {
    type: String,
    default: '',
    trim: true,
    comment: '手机'
  },
  fax: {
    type: String,
    default: '',
    trim: true,
    comment: '传真'
  },
  companyAddress: {
    type: String,
    default: '',
    trim: true,
    comment: '公司地址'
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
  collection: 'alibaba_customers' // 指定集合名称
})

// 创建索引以提高查询性能
alibabaCustomerSchema.index({ companyName: 1 })
alibabaCustomerSchema.index({ phone: 1 })
alibabaCustomerSchema.index({ createdAt: -1 })
alibabaCustomerSchema.index({ createdBy: 1 })

const AlibabaCustomer = mongoose.model('AlibabaCustomer', alibabaCustomerSchema)

export default AlibabaCustomer

