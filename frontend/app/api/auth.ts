import { axiosInstance } from "~/lib/axios";
import type { CredentialsI } from "~/types/types";

const authInstance = {
    login: async (credentials: CredentialsI) => (await axiosInstance.post("", {})).data
}