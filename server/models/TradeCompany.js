import mongoose from 'mongoose'

const tradeCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: false,
    trim: true,
    default: '',
    index: true,
    comment: '城市'
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  category: {
    type: String,
    required: false,
    trim: true,
    default: '外贸公司'
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  source: {
    type: String,
    default: '腾讯地图',
    enum: ['腾讯地图', '其他']
  },
  sourceId: {
    type: String,
    required: false,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  remark: {
    type: String,
    default: ''
  },
  crawledAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'trade_companies'
})

// 创建索引
tradeCompanySchema.index({ name: 1 })
tradeCompanySchema.index({ sourceId: 1 })
tradeCompanySchema.index({ createdAt: -1 })
tradeCompanySchema.index({ status: 1 })
tradeCompanySchema.index({ category: 1 })

// 防止重复数据（基于sourceId或name+address）
tradeCompanySchema.index({ sourceId: 1 }, { unique: true, sparse: true })

const TradeCompany = mongoose.model('TradeCompany', tradeCompanySchema)

export default TradeCompany

