"use client";

export default function EmployeeDashboard() {
  // 假資料 - 之後會從 Supabase 查詢
  const selfEvaluationTasks = [
    { id: 1, sessionName: "2025/04 月度 360", status: "pending" },
    { id: 2, sessionName: "2025/03 月度 360", status: "completed" },
  ];

  const peerEvaluationTasks = [
    { id: 1, targetName: "張三", sessionName: "2025/04 月度 360", status: "pending" },
    { id: 2, targetName: "李四", sessionName: "2025/04 月度 360", status: "pending" },
    { id: 3, targetName: "王五", sessionName: "2025/03 月度 360", status: "completed" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">員工儀表板</h1>

      {/* 自評任務區塊 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">自評任務</h2>
        {selfEvaluationTasks.length === 0 ? (
          <p className="text-gray-500">目前沒有待處理的自評任務</p>
        ) : (
          <ul className="space-y-3">
            {selfEvaluationTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-900">{task.sessionName}</span>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      task.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.status === "pending" ? "待處理" : "已完成"}
                  </span>
                </div>
                {task.status === "pending" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    開始填寫
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 需要評價的夥伴列表 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">需要你評價的夥伴</h2>
        {peerEvaluationTasks.length === 0 ? (
          <p className="text-gray-500">目前沒有待評價的夥伴</p>
        ) : (
          <ul className="space-y-3">
            {peerEvaluationTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-900">{task.targetName}</span>
                  <span className="ml-3 text-sm text-gray-500">{task.sessionName}</span>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      task.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.status === "pending" ? "待處理" : "已完成"}
                  </span>
                </div>
                {task.status === "pending" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    開始評價
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

