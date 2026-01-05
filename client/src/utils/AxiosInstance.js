// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     if (user && config.method === "get") {
//       const role = user.role;
      
//       if (role === "Admin") {
//         config.params = {
//           ...config.params,
//           department_id: user.department_id,
//         };
//       }

//       if (role === "Kepala Instalasi") {
//         config.params = {
//           ...config.params,
//           department_id: user.department_id,
//         };
//       }

//       if (role === "Kepala Sub-Instalasi") {
//         config.params = {
//           ...config.params,
//           sub_department_id: user.sub_department_id,
//         };
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;

//     if (status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/";
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (user && config.method === "get") {
      const role = user.role;
      
      if (role === "Admin") {
        config.params = {
          ...config.params,
          department_id: user.department_id,
        };
      }
      if (role === "Kepala Instalasi") {
        config.params = {
          ...config.params,
          department_id: user.department_id,
        };
      }
      if (role === "Kepala Sub-Instalasi") {
        config.params = {
          ...config.params,
          sub_department_id: user.sub_department_id,
        };
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;