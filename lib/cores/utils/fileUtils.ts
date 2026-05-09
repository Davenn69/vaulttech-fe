import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PageRoutes } from "./navigation";

export function openFile(
  extension: string,
  id: string,
  router: AppRouterInstance,
) {
  switch (extension) {
    case "docx":
      router.push(PageRoutes.wordFile(id));
      break;
    case "xlsx":
      router.push(PageRoutes.excelFile(id));
      break;
    case "pdf":
      router.push(PageRoutes.pdfFile(id));
      break;
    default:
      break;
  }
}
