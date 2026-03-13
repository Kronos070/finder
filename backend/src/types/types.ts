export interface ResponseItemI {
    id: string
    title: string
    createdAt: string
    path: string
    type: "file" | "folder"
}

export interface RequestItemI {
    id: string
    title: string
    createdAt: string
    path: string
    type: "file" | "folder"
    children: RequestItemI[]
}