import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Load user gagal:", err);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // 💾 Simpan user dari response login
  const saveUser = (loginResponse) => {
    const { token, role, user_role_id, user } = loginResponse;

    if (!token || !user) {
      console.error("Response login tidak valid");
      return;
    }

    const normalizedUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      phone: user.phone,
      avatar: user.avatar,
      role, 
      user_role_id,
      department_id: user.department?.department_id ?? null,
      department_name: user.department?.department_name ?? null,
      sub_department_id: user.sub_department?.sub_department_id ?? null,
      sub_department_name: user.sub_department?.sub_department_name ?? null,
      location_id: user.location?.location_id ?? null,
      location_name: user.location?.location_name ?? null,
    };

    setUser(normalizedUser);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        saveUser,
        clearUser,
        isAuthenticated: !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;