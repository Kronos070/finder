import type { RequestItemI, ResponseItemI } from "../types/types";

export default function FilesTreeConverterService(files: ResponseItemI[]): RequestItemI[] {
    const rootItems: RequestItemI[] = [];
    const foldersMap = new Map<string, RequestItemI>();

    for (const file of files) {
        const targetPath = file.path.endsWith("/") && file.path.length > 1 
            ? file.path.slice(0, -1) 
            : file.path;

        const requestItem: RequestItemI = {
            ...file,
            children: []
        };

        if (file.type === "folder") {
            const absolutePath = file.path === "/" 
                ? `/${file.title}` 
                : `${file.path}/${file.title}`;
            foldersMap.set(absolutePath, requestItem);
        }

        if (targetPath === "/") {
            rootItems.push(requestItem);
        } else {
            const parentFolder = foldersMap.get(targetPath);
            if (parentFolder) {
                parentFolder.children.push(requestItem);
            } else {
                rootItems.push(requestItem);
            }
        }
    }

    return rootItems;
}