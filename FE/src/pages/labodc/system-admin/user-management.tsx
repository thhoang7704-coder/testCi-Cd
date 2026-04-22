import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:8082/api/v1/users";

const ROLE_OPTIONS = [
  "SYSTEM_ADMIN",
  "LAB_ADMIN",
  "COMPANY",
  "MENTOR",
  "TALENT",
  "USER",
] as const;

interface User {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form user thường
  const [userForm, setUserForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    roles: [] as string[],
    isActive: true,
  });

  // Form mentor
  const [mentorForm, setMentorForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    expertise: "",
    yearsExperience: 0,
    bio: "",
    isActive: true,
  });

  // Form edit
  const [editForm, setEditForm] = useState({
    email: "",
    fullName: "",
    username: "",
    phone: "",
    isActive: true,
    roles: [] as string[],
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      toast.error("Không tải được danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user thường
  const handleAddUser = async () => {
    if (!userForm.fullName.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (userForm.roles.includes("MENTOR")) {
      toast.warn("Role MENTOR chỉ tạo qua chức năng Thêm Mentor");
      return;
    }

    try {
      await axios.post(`${API_BASE}/`, userForm);
      toast.success("Tạo user thành công");
      setShowAddUser(false);
      resetUserForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo user thất bại");
    }
  };

  const resetUserForm = () => {
    setUserForm({
      fullName: "",
      username: "",
      email: "",
      password: "",
      roles: [],
      isActive: true,
    });
  };

  // Add mentor
  const handleAddMentor = async () => {
    if (!mentorForm.fullName.trim() || !mentorForm.email.trim() || !mentorForm.password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin mentor");
      return;
    }

    const payload = {
      email: mentorForm.email,
      password: mentorForm.password,
      fullName: mentorForm.fullName,
      username: mentorForm.username,
      phone: mentorForm.phone,
      expertise: mentorForm.expertise,
      yearsExperience: mentorForm.yearsExperience,
      bio: mentorForm.bio,
      isActive: mentorForm.isActive,
    };

    try {
      // Sử dụng endpoint /mentor (đã có trong controller bạn gửi)
      await axios.post(`${API_BASE}/mentor`, payload);
      toast.success("Tạo mentor thành công");
      setShowAddMentor(false);
      resetMentorForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo mentor thất bại");
    }
  };

  const resetMentorForm = () => {
    setMentorForm({
      fullName: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      expertise: "",
      yearsExperience: 0,
      bio: "",
      isActive: true,
    });
  };

  // View user
  const handleViewUser = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      setSelectedUser(res.data.data);
      setShowView(true);
    } catch (err) {
      toast.error("Không lấy được thông tin user");
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      fullName: user.fullName,
      username: user.username || "",
      phone: user.phone || "",
      isActive: user.isActive,
      roles: user.roles,
    });
    setShowEdit(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(`${API_BASE}/${selectedUser.id}`, editForm);
      toast.success("Cập nhật user thành công");
      setShowEdit(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // Disable user
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn vô hiệu hóa user này?")) return;

    try {
      await axios.put(`${API_BASE}/${id}/disable`);
      toast.success("User đã được vô hiệu hóa");
      fetchUsers();
    } catch (err: any) {
      toast.error("Vô hiệu hóa thất bại");
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải danh sách...</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <Button
            text="Thêm User"
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={() => setShowAddUser(true)}
          />
        </div>

        <Card>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Tên</th>
                <th className="py-2">Email</th>
                <th className="py-2">Roles</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="py-3">{u.fullName}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.roles.join(", ")}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-4">
                      <button className="text-blue-600 hover:underline" onClick={() => handleViewUser(u.id)}>
                        Xem
                      </button>
                      <button className="text-green-600 hover:underline" onClick={() => handleEditUser(u)}>
                        Sửa
                      </button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDeleteUser(u.id)}>
                        Vô hiệu hóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* MODAL ADD USER THÔNG THƯỜNG */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Thêm User Thông Thường</h2>

            <div className="space-y-4">
              <input className="w-full border rounded-lg p-3" placeholder="Họ tên" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
              <input className="w-full border rounded-lg p-3" placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
              <input className="w-full border rounded-lg p-3" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <input type="password" className="w-full border rounded-lg p-3" placeholder="Mật khẩu" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />

              <select
                className="w-full border rounded-lg p-3 h-32"
                multiple
                value={userForm.roles}
                onChange={(e) => setUserForm({ ...userForm, roles: Array.from(e.target.selectedOptions, (o) => o.value).filter(r => r !== "MENTOR") })}
              >
                {ROLE_OPTIONS.filter(r => r !== "MENTOR").map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                text="Thêm Mentor"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                onClick={() => {
                  setShowAddUser(false); // Đóng modal user
                  setShowAddMentor(true); // Mở modal mentor
                }}
              />
              <div className="flex gap-3">
                <Button text="Hủy" className="border border-gray-300 px-5 py-2 rounded-lg" onClick={() => setShowAddUser(false)} />
                <Button text="Tạo User" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg" onClick={handleAddUser} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD MENTOR (độc lập, bên phải) */}
      {showAddMentor && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Thêm Mentor</h2>
                <button className="text-3xl text-gray-500 hover:text-gray-700" onClick={() => setShowAddMentor(false)}>
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <input className="w-full border rounded-lg p-3" placeholder="Họ tên" value={mentorForm.fullName} onChange={(e) => setMentorForm({ ...mentorForm, fullName: e.target.value })} />
                <input className="w-full border rounded-lg p-3" placeholder="Username" value={mentorForm.username} onChange={(e) => setMentorForm({ ...mentorForm, username: e.target.value })} />
                <input className="w-full border rounded-lg p-3" placeholder="Email" value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} />
                <input type="password" className="w-full border rounded-lg p-3" placeholder="Mật khẩu" value={mentorForm.password} onChange={(e) => setMentorForm({ ...mentorForm, password: e.target.value })} />
                <input className="w-full border rounded-lg p-3" placeholder="Số điện thoại" value={mentorForm.phone} onChange={(e) => setMentorForm({ ...mentorForm, phone: e.target.value })} />
                <input className="w-full border rounded-lg p-3" placeholder="Chuyên môn" value={mentorForm.expertise} onChange={(e) => setMentorForm({ ...mentorForm, expertise: e.target.value })} />
                <input type="number" className="w-full border rounded-lg p-3" placeholder="Số năm kinh nghiệm" value={mentorForm.yearsExperience} onChange={(e) => setMentorForm({ ...mentorForm, yearsExperience: Number(e.target.value) || 0 })} />
                <textarea className="w-full border rounded-lg p-3 h-32" placeholder="Giới thiệu ngắn (bio)" value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button text="Hủy" className="border border-gray-300 px-6 py-2 rounded-lg" onClick={() => setShowAddMentor(false)} />
                <Button text="Tạo Mentor" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg" onClick={handleAddMentor} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal View */}
      {showView && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Chi tiết User</h2>
            <p><b>Tên:</b> {selectedUser.fullName}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Roles:</b> {selectedUser.roles.join(", ")}</p>
            <p><b>Trạng thái:</b> {selectedUser.isActive ? "Hoạt động" : "Vô hiệu"}</p>
            <div className="flex justify-end mt-6">
              <Button text="Đóng" className="border px-6 py-2 rounded-lg" onClick={() => setShowView(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h2 className="text-xl font-bold">Cập nhật User</h2>

            <input className="w-full border rounded-lg p-3" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input className="w-full border rounded-lg p-3" placeholder="Họ tên" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
            <input className="w-full border rounded-lg p-3" placeholder="Username" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            <input className="w-full border rounded-lg p-3" placeholder="Số điện thoại" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />

            <div>
              <label className="block text-sm font-medium mb-1">Roles</label>
              <select
                multiple
                className="w-full border rounded-lg p-3 h-32"
                value={editForm.roles}
                onChange={(e) => setEditForm({ ...editForm, roles: Array.from(e.target.selectedOptions, (o) => o.value) })}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <select
              className="w-full border rounded-lg p-3"
              value={editForm.isActive ? "true" : "false"}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
            >
              <option value="true">Hoạt động</option>
              <option value="false">Vô hiệu</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <Button text="Hủy" className="border px-6 py-2 rounded-lg" onClick={() => setShowEdit(false)} />
              <Button text="Cập nhật" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg" onClick={handleUpdateUser} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;