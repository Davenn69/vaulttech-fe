import { folderStorage } from "./local";

export class PageRoutes {
  static readonly repository = "/repo";
  static readonly repositoryRecent = "/repo/recent";
  static readonly repositoryFavourites = "/repo/favourites";
  static readonly repositoryTrash = "/repo/trash";
  static readonly repositoryCategory = "/repo/category";
  static readonly repositoryReview = "/repo/review";
  static readonly invitations = "/invitations";
  static readonly invitationsHistory = "/invitations/history";

  static repositoryRoot() {
    const folderId = folderStorage.getParentFolderId();
    return `/repo/${folderId}`;
  }

  static repositoryFolder(id: string) {
    return `/repo/${id}`;
  }

  static repositoryReviewDetail(id: string) {
    return `/repo/review/${id}`;
  }

  static wordFile(id: string) {
    return `/word/${id}`;
  }

  static pdfFile(id: string) {
    return `/pdf/${id}`;
  }

  static powerpointFile(id: string) {
    return `/powerpoint/${id}`;
  }

  static recordFile(id: string) {
    return `/record/${id}`;
  }

  static excelFile(id: string) {
    return `/excel/${id}`;
  }

  static repositoryInvitationDetail(id: string) {
    return `/invitations/${id}`;
  }
}
