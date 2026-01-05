import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const CreateEditUsers = ({ open, onClose, onSuccess, selected }) => {
  const { user } = useUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
    phone_number: "",
    display_name: "",
    department_id: "",
    national_id_number: "",
    employee_id_number: "",
    sub_department_id: "",
    location_id: "",
    user_role_id: "",
    avatar: null,
    title_prefix: "",
    full_name: "",
    title_suffix: "",
    gender: "",
    birth_date: "",
    address: "",
    employee_status_id: "",
    hire_date: "",
    termination_date: "",
  });

  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch functions...
  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DEPARTMENT.GET_ALL);
      let result = res.data.data || [];

      if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
        result = result.filter((sd) => sd.department_id === user.department_id);
      } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
        result = result.filter((sd) => sd.department_id === user.department_id);
      }

      setDepartments(result);
    } catch {
      toast.error("Gagal mengambil data department");
    }
  };

  const fetchSubDepartments = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SUB_DEPARTMENTS.GET_ALL);
      let result = res.data.data || [];

      if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
        result = result.filter((sd) => sd.department_id === user.department_id);
      } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
        result = result.filter((sd) => sd.sub_department_id === user.sub_department_id);
      }

      setSubDepartments(result);
    } catch {
      toast.error("Gagal mengambil data sub department");
    }
  };

  const fetchUserRoles = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USER_ROLES.GET_ALL);
      let roles = res.data.data || [];

      if (user.user_role_id === ROLES.ADMIN) {
        // Admin lihat semua role
      } else if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
        roles = roles.filter((role) => role.user_role_id !== ROLES.ADMIN);
      } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
        roles = roles.filter(
          (role) => ![ROLES.ADMIN, ROLES.KEPALA_INSTALASI].includes(role.user_role_id)
        );
      }

      setUserRoles(roles);
    } catch {
      toast.error("Gagal mengambil data user roles");
    }
  };

  const fetchEmployeeStatus = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.EMPLOYEE_STATUS.GET_ALL);
      setEmployeeStatus(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil data employee status");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.LOCATION.GET_ALL);
      setLocations(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil data lokasi");
    }
  };

  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchSubDepartments();
      fetchUserRoles();
      fetchEmployeeStatus();
      fetchLocations();
    }

    if (selected) {
      setForm({
        email: selected.email || "",
        phone_number: selected.phone_number || "",
        display_name: selected.display_name || "",
        department_id: selected.department_id || "",
        national_id_number: selected.national_id_number || "",
        employee_id_number: selected.employee_id_number || "",
        sub_department_id: selected.sub_department_id || "",
        location_id: selected.location_id || "",
        user_role_id: selected.user_role_id || "",
        title_prefix: selected.user_details.title_prefix || "",
        full_name: selected.user_details.full_name || "",
        title_suffix: selected.user_details.title_suffix || "",
        gender: selected.user_details.gender || "",
        birth_date: selected.user_details.birth_date
          ? selected.user_details.birth_date.split("T")[0]
          : "",
        address: selected.user_details.address || "",
        employee_status_id: selected.user_details.employee_status_id || "",
        hire_date: selected.user_details.hire_date
          ? selected.user_details.hire_date.split("T")[0]
          : "",
        termination_date: selected.user_details.termination_date
          ? selected.user_details.termination_date.split("T")[0]
          : "",
        password: "",
        avatar: null,
      });
    } else {
      setForm((prev) => ({
        ...prev,
        email: "",
        password: "",
        phone_number: "",
        display_name: "",
        department_id: "",
        national_id_number: "",
        employee_id_number: "",
        sub_department_id: "",
        location_id: "",
        user_role_id: "",
        avatar: null,
        title_prefix: "",
        full_name: "",
        title_suffix: "",
        gender: "",
        birth_date: "",
        address: "",
        employee_status_id: "",
        hire_date: "",
        termination_date: "",
      }));
    }
  }, [selected, open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        avatar: file,
        avatar_preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = new FormData();
      Object.keys(form).forEach((key) => {
        if (key !== "avatar_preview") {
          payload.append(key, form[key] ?? "");
        }
      });

      if (selected && !form.password) payload.delete("password");

      if (selected) {
        await axiosInstance.put(
          API_PATHS.USERS.UPDATE.replace(":id", selected.user_id),
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("User berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.USERS.CREATE, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("User berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit User" : "Tambah User"}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-turqoise text-white px-4 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      }
    >
      {/* Grid 4 kolom */}
      <div className="grid grid-cols-4 gap-4">
        {/* Baris 1 */}
        <div>
          <label className="text-sm font-medium mb-1 block">National ID Number</label>
          <input
            type="text"
            name="national_id_number"
            value={form.national_id_number}
            onChange={handleChange}
            placeholder="7317481238488"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Employee ID Number</label>
          <input
            type="text"
            name="employee_id_number"
            value={form.employee_id_number}
            onChange={handleChange}
            placeholder="7317140349123"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="muhzulkifli@example.com"
            className="w-full border p-2 rounded"
          />
        </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full border p-2 rounded"
            />
          </div>

        {/* Baris 2 */}
        <div>
          <label className="text-sm font-medium mb-1 block">Display Name</label>
          <input
            type="text"
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            placeholder="Muhammad Zulkifli"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Nomor Telepon</label>
          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="082239532293"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Department</label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Department --</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sub Department</label>
          <select
            name="sub_department_id"
            value={form.sub_department_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Sub Departemnt --</option>
            {subDepartments.map((sd) => (
              <option key={sd.sub_department_id} value={sd.sub_department_id}>
                {sd.sub_department_name}
              </option>
            ))}
          </select>
        </div>

        {/* Baris 3 */}
        <div>
          <label className="text-sm font-medium mb-1 block">User Roles</label>
          <select
            name="user_role_id"
            value={form.user_role_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih User Roles --</option>
            {userRoles.map((role) => (
              <option key={role.user_role_id} value={role.user_role_id}>
                {role.user_role_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Employee Status</label>
          <select
            name="employee_status_id"
            value={form.employee_status_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Employee Status --</option>
            {employeeStatus.map((status) => (
              <option key={status.employee_status_id} value={status.employee_status_id}>
                {status.status_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Location</label>
          <select
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Locations --</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.location_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Gender --</option>
            <option value="Laki-Laki">Laki-Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        {/* Baris 4 */}
        <div>
          <label className="text-sm font-medium mb-1 block">Title Prefix</label>
          <input
            type="text"
            name="title_prefix"
            value={form.title_prefix}
            onChange={handleChange}
            placeholder="Mr."
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Muhammad Zulkifli"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Title Suffix</label>
          <input
            type="text"
            name="title_suffix"
            value={form.title_suffix}
            onChange={handleChange}
            placeholder="Jr"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Birth Date</label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Baris 5 */}
        <div className="col-span-4">
          <label className="text-sm font-medium mb-1 block">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Daeng Tata, Hartaco Indah"
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Hire Date</label>
          <input
            type="date"
            name="hire_date"
            value={form.hire_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Termination Date</label>
          <input
            type="date"
            name="termination_date"
            value={form.termination_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-4">
          <label className="text-sm font-medium mb-1 block">Avatar</label>
          <div className="flex items-center gap-4 border p-2 rounded">
            <input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default CreateEditUsers;