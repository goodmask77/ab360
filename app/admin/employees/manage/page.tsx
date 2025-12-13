"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";

interface Employee {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: "staff" | "duty" | "owner";
  department: string | null;
  created_at: string;
}

export default function ManageEmployeesPage() {
  const { isAdmin, loading: authLoading } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff" as "staff" | "duty" | "owner",
    department: "front",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/home");
    } else if (!authLoading && isAdmin) {
      loadEmployees();
    }
  }, [isAdmin, authLoading, router]);

  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "載入失敗");
      }

      setEmployees(result.data || []);
    } catch (err: any) {
      console.error("載入員工列表錯誤:", err);
      setError(err.message || "載入員工列表失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      role: "staff",
      department: "front",
    });
    setError(null);
    setShowAddModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department || "front",
    });
    setError(null);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定要刪除員工「${name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "刪除失敗");
      }

      await loadEmployees();
    } catch (err: any) {
      alert("刪除失敗: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = "/api/admin/employees";
      const method = editingEmployee ? "PUT" : "POST";
      const body = editingEmployee
        ? { id: editingEmployee.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "操作失敗");
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingEmployee(null);
      await loadEmployees();
    } catch (err: any) {
      setError(err.message || "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="primary" size="sm">管理員</Badge>;
      case "duty":
        return <Badge variant="warning" size="sm">Duty</Badge>;
      default:
        return <Badge variant="secondary" size="sm">夥伴</Badge>;
    }
  };

  const getDepartmentText = (dept: string | null) => {
    if (dept === "front") return "外場";
    if (dept === "back") return "內場";
    if (dept === "management") return "管理層";
    return dept || "未設定";
  };

  if (authLoading || loading) {
    return (
      <MobileLayout title="員工管理">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title="員工管理" showHomeButton={true}>
        <div className="space-y-4">
          {/* 操作按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ➕ 新增員工
            </button>
          </div>

          {/* 員工表格 */}
          {employees.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">目前沒有員工資料</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        姓名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        等級
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        部門
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {employee.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getRoleBadge(employee.role)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getDepartmentText(employee.department)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              編輯
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(employee.id, employee.name)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 新增/編輯 Modal */}
          {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingEmployee ? "編輯員工" : "新增員工"}
                </h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      等級
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "staff" | "duty" | "owner",
                        })
                      }
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="staff">夥伴</option>
                      <option value="duty">Duty</option>
                      <option value="owner">管理員</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      部門
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="front">外場</option>
                      <option value="back">內場</option>
                      <option value="management">管理層</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setEditingEmployee(null);
                        setError(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? "處理中..."
                        : editingEmployee
                        ? "更新"
                        : "新增"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}

