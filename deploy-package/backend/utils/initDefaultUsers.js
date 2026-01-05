import bcrypt from 'bcryptjs'

// 初始化默认用户数据（带密码）
export async function getDefaultUsers() {
  // 默认密码：123456
  const defaultPassword = await bcrypt.hash('123456', 10)

  return [
    {
      id: '1',
      username: 'admin',
      password: defaultPassword,
      email: 'admin@example.com',
      phone: '13800138000',
      company: '系统管理员',
      country: '中国',
      status: 'active',
      createTime: '2024-01-15 10:30:00',
      remark: '系统管理员账户'
    },
    {
      id: '2',
      username: 'zhangsan',
      password: defaultPassword,
      email: 'zhangsan@example.com',
      phone: '13800138001',
      company: '顺丰速运',
      country: '中国',
      status: 'active',
      createTime: '2024-01-15 10:30:00',
      remark: 'VIP客户'
    },
    {
      id: '3',
      username: 'lisi',
      password: defaultPassword,
      email: 'lisi@example.com',
      phone: '13800138002',
      company: 'DHL国际快递',
      country: '德国',
      status: 'active',
      createTime: '2024-01-16 14:20:00',
      remark: ''
    },
    {
      id: '4',
      username: 'wangwu',
      password: defaultPassword,
      email: 'wangwu@example.com',
      phone: '13800138003',
      company: 'FedEx联邦快递',
      country: '美国',
      status: 'inactive',
      createTime: '2024-01-17 09:15:00',
      remark: '暂停合作'
    },
    {
      id: '5',
      username: 'zhaoliu',
      password: defaultPassword,
      email: 'zhaoliu@example.com',
      phone: '13800138004',
      company: 'UPS联合包裹',
      country: '美国',
      status: 'active',
      createTime: '2024-01-18 16:45:00',
      remark: ''
    },
    {
      id: '6',
      username: 'sunqi',
      password: defaultPassword,
      email: 'sunqi@example.com',
      phone: '13800138005',
      company: 'TNT快递',
      country: '荷兰',
      status: 'active',
      createTime: '2024-01-19 11:30:00',
      remark: '长期合作伙伴'
    }
  ]
}

