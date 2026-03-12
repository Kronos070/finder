import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.URL || "",
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

