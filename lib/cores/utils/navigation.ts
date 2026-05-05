import { folderStorage } from "./local";

export class PageRoutes {
  static readonly repository = "/repo";
  static readonly repositoryRecent = "/repo/recent";
  static readonly repositoryFavourites = "/repo/favourites";
  static readonly repositoryTrash = "/repo/trash";

  static repositoryRoot() {
    const folderId = folderStorage.getParentFolderId();
    return `/repo/${folderId}`;
  }

  static repositoryFolder(id: string) {
    return `/repo/${id}`;
  }

  static wordFile(id: string) {
    return `/word/${id}`;
  }

  static pdfFile(id: string) {
    return `/pdf/${id}`;
  }

  static excelFile(id: string) {
    return `/excel/${id}`;
  }
}
