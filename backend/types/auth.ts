export type UserRole = 'admin' | 'user'

export interface UserDataDTO {
    name: string
    password: string
    role: UserRole
}

export interface CredentialsDTO {
    name: string
    password: string
}