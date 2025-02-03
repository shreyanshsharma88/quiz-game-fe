import axios from "axios";
import { toast } from "react-toastify";

export const authAxios = axios.create({
  baseURL: "http://localhost:8080",
});

authAxios.interceptors.request.use(
  (conf) => {
    const token = localStorage.getItem("token");
    if (token) {
      conf.headers["token"] = token;
    }
    return conf;
  },
  (err) => {
    console.log(err);

    if (err.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

authAxios.interceptors.response.use(
  (res) => {
    if (res.status === 401) {
      toast.error("Seems like someone is intruding, huhh?");
      localStorage.clear();
      window.location.href = "/";
      return res;
    }
    return res;
  },
  (err) => {
    console.log(err);
    toast.error(err.response.data.error ?? "Something went wrong");
    if (err.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);
