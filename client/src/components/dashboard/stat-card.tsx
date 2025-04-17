interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change?: string | number;
  changeType?: 'increase' | 'decrease';
  changeSuffix?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  change,
  changeType = 'increase',
  changeSuffix = 'from last month'
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <i className={`${icon} text-xl ${iconColor}`}></i>
        </div>
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          <span className={changeType === 'increase' ? 'text-green-500 flex items-center' : 'text-red-500 flex items-center'}>
            <i className={changeType === 'increase' ? 'ri-arrow-up-line mr-1' : 'ri-arrow-down-line mr-1'}></i>
            <span>{change}</span>
          </span>
          <span className="text-gray-400 ml-2">{changeSuffix}</span>
        </div>
      )}
    </div>
  );
}
