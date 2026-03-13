import { Hono } from "hono";
import type { ResponseItemI } from "../types/types";
import FilesTreeConverterService from "../services/filesTreeConverter.service";


const driveDataMock: ResponseItemI[] = [
  // ==========================================
  // КОРЕНЬ (/)
  // ==========================================
  { id: "f-001", title: "global-readme.docx", createdAt: "2026-03-12T18:00:00Z", path: "/", type: 'file' },
  { id: "dir-001", title: "hr", createdAt: "2026-01-01T00:00:00Z", path: "/", type: 'folder' },
  { id: "dir-002", title: "it", createdAt: "2026-01-01T00:00:00Z", path: "/", type: 'folder' },
  { id: "dir-003", title: "finance", createdAt: "2026-01-01T00:00:00Z", path: "/", type: 'folder' },

  // ==========================================
  // ВНУТРИ /hr
  // ==========================================
  { id: "f-hr-001", title: "staff-list-2026.docx", createdAt: "2026-01-15T09:00:00Z", path: "/hr", type: 'file' },
  { id: "dir-hr-001", title: "students", createdAt: "2026-02-01T10:00:00Z", path: "/hr", type: 'folder' },

  // Вложенная в /hr/students
  { id: "f-stud-001", title: "intern-ivanov-contract.docx", createdAt: "2026-03-01T10:00:00Z", path: "/hr/students", type: 'file' },

  // ==========================================
  // ВНУТРИ /it
  // ==========================================
  { id: "f-it-001", title: "network-schema.docx", createdAt: "2026-02-10T09:00:00Z", path: "/it", type: 'file' },
  { id: "dir-it-001", title: "hardware", createdAt: "2026-02-11T10:00:00Z", path: "/it", type: 'folder' },
  { id: "dir-it-002", title: "software", createdAt: "2026-02-11T10:00:00Z", path: "/it", type: 'folder' },

  // Вложенная в /it/hardware
  { id: "f-hw-001", title: "laptops-inventory.docx", createdAt: "2026-02-15T10:00:00Z", path: "/it/hardware", type: 'file' },

  // ==========================================
  // ВНУТРИ /finance
  // ==========================================
  { id: "f-fin-001", title: "budget-summary.docx", createdAt: "2026-03-08T08:00:00Z", path: "/finance", type: 'file' },
  { id: "dir-fin-001", title: "payroll", createdAt: "2026-03-09T09:00:00Z", path: "/finance", type: 'folder' },

  // Вложенная в /finance/payroll
  { id: "f-pay-001", title: "march-salaries.docx", createdAt: "2026-03-10T12:00:00Z", path: "/finance/payroll", type: 'file' }
];

const files = new Hono()
    .get('/', async (c) => {
        try {
            const filesTree = FilesTreeConverterService(driveDataMock)

            return c.json({ files: filesTree })
        } catch (err) {
            console.log(err)
            return c.json({ error: "Internal server error" }, 500)
        }
    })

    // .get('/:id', async (c) => {
    //     try {
    //         const id = c.req.param('id')
    //         const file = hrFilesMock.find((file) => file.id === id)

    //         if (!file) {
    //             return c.json({ error: "File not found" }, 404)
    //         }

    //         return c.json({ file })
    //     } catch (err) {
    //         console.log(err)
    //         return c.json({ error: "File not found" }, 404)
    //     }
    // })

export default files