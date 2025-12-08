"use client";

export default function AdminDashboard() {
  // 假資料 - 之後會從 Supabase 查詢
  const evaluationSessions = [
    {
      id: 1,
      name: "2025/04 月度 360",
      status: "open",
      startAt: "2025-04-01",
      endAt: "2025-04-30",
    },
    {
      id: 2,
      name: "2025/03 月度 360",
      status: "closed",
      startAt: "2025-03-01",
      endAt: "2025-03-31",
    },
    {
      id: 3,
      name: "2025/05 月度 360",
      status: "draft",
      startAt: "2025-05-01",
      endAt: "2025-05-31",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: "草稿", className: "bg-gray-100 text-gray-800" },
      open: { label: "進行中", className: "bg-green-100 text-green-800" },
      closed: { label: "已結束", className: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 text-xs rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleManage = (sessionId: number) => {
    // TODO: 導向管理頁面
    console.log("進入管理，場次 ID:", sessionId);
    alert(`TODO: 進入場次 ${sessionId} 的管理頁面`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          建立新場次
        </button>
      </div>

      {/* 評鑑場次列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">評鑑場次列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  場次名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開始日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  結束日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluationSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{session.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(session.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.startAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.endAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleManage(session.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      進入管理
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

