import re

with open('C:/Users/andii/OneDrive/Desktop/car-marketplace/src/pages/AdminPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the pattern - just before {activeTab === 'messages' && (
pattern = "{activeTab === 'messages' && ("

# Chart code to insert
charts = '''

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    {isSl ? 'Obiskovalci in prihodki (30 dni)' : 'Visitors & Revenue (30 Days)'}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="visitors" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVisitors)" name={isSl ? 'Obiskovalci' : 'Visitors'} />
                        <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" name={isSl ? 'Prihodki' : 'Revenue'} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    {isSl ? 'Mesecna statistika' : 'Monthly Statistics'}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="visitors" fill="#3B82F6" name={isSl ? 'Obiskovalci' : 'Visitors'} radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="revenue" fill="#8B5CF6" name={isSl ? 'Prihodki' : 'Revenue'} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-bold mb-4">{isSl ? 'Podroben pregled (zadnjih 30 dni)' : 'Detailed Overview (Last 30 Days)'}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">{isSl ? 'Datum' : 'Date'}</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">{isSl ? 'Obiskovalci' : 'Visitors'}</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">{isSl ? 'Prihodki' : 'Revenue'}</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">{isSl ? 'Paketi' : 'Packages'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.slice(-10).reverse().map(d => (
                        <tr key={d.date} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm">{d.date}</td>
                          <td className="py-2 px-3 text-sm text-right text-blue-600">{d.visitors}</td>
                          <td className="py-2 px-3 text-sm text-right text-green-600">{formatPrice(d.revenue)}</td>
                          <td className="py-2 px-3 text-sm text-right text-purple-600">{d.packages}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

'''

# Insert charts before the messages tab
content = content.replace(pattern, charts + pattern, 1)

with open('C:/Users/andii/OneDrive/Desktop/car-marketplace/src/pages/AdminPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Charts added')