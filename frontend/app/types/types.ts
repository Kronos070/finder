export interface CredentialsI {
    email: string
    password: string
}

export interface UserI {
  name: string
  role: string
  email?: string
}

export interface ApiError {
  error: string
}

export interface ItemI {
  id: string
  title: string
  createdAt: string
  path: string
  type: "file" | "folder"
  children: ItemI[]
}