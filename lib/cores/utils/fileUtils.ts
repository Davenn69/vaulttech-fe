import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { api } from "./api";
import { ApiResponse } from "../types/api_response";
import { PhotoModel } from "@/lib/features/home/types/photo";
import { PageRoutes } from "./navigation";

export function isImageExtension(extension: string) {
  const normalizedExtension = extension.toLowerCase().replaceAll(".", "");

  return ["jpg", "jpeg", "png"].includes(normalizedExtension);
}

export async function openPhotoViewer(id: string) {
  try {
    const res = await api.get<ApiResponse<PhotoModel>>(`/file/${id}/signedUrl`);
    return res.data;
  } catch {
    return undefined;
  }
}

export function openFile(
  extension: string,
  id: string,
  router: AppRouterInstance,
  onOpenPhotoViewer?: (photo: PhotoModel) => void | Promise<void>,
) {
  const normalizedExtension = extension.toLowerCase().replaceAll(".", "");

  switch (normalizedExtension) {
    case "docx":
      router.push(PageRoutes.wordFile(id));
      break;
    case "xlsx":
      router.push(PageRoutes.excelFile(id));
      break;
    case "pdf":
      router.push(PageRoutes.pdfFile(id));
      break;
    case "ppt":
    case "pptx":
      router.push(PageRoutes.powerpointFile(id));
      break;
    case "jpg":
    case "jpeg":
    case "png":
      if (onOpenPhotoViewer) {
        void openPhotoViewer(id).then((photo) => {
          if (photo) {
            void onOpenPhotoViewer(photo);
          }
        });
      }
      break;
    default:
      break;
  }
}
