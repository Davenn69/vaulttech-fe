import { api } from "@/lib/cores/utils/api";
import { FileModel } from "./file";
import { FolderModel } from "./folder";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import axios from "axios";

export type DraggableItemModel = FileModel | FolderModel;

function isFileModel(item: DraggableItemModel): item is FileModel {
  return "folderId" in item;
}

function isFolderModel(item: DraggableItemModel): item is FolderModel {
  return "parentId" in item;
}

interface DragState {
  draggedItem: DraggableItemModel | null;
  previousParentId: string | null;
}

class ItemManager {
  private dragState: DragState = {
    draggedItem: null,
    previousParentId: null,
  };

  private items: Map<string, DraggableItemModel> = new Map();
  private cleanups: Array<() => void> = [];

  constructor(private apiBase: string) {}

  registerDraggable(element: HTMLElement, item: DraggableItemModel): void {
    element.setAttribute("draggable", "true");
    this.items.set(item.id, item);

    const handleDragStart = (e: DragEvent) =>
      this.onDragStart(e, element, item);
    const handleDragEnd = () => this.onDragEnd(element);

    element.addEventListener("dragstart", handleDragStart);
    element.addEventListener("dragend", handleDragEnd);

    this.cleanups.push(() => {
      element.removeEventListener("dragstart", handleDragStart);
      element.removeEventListener("dragend", handleDragEnd);
    });
  }

  registerDropTarget(element: HTMLElement, targetItem: FolderModel): void {
    const handleDragOver = (e: DragEvent) => this.onDragOver(e, element);
    const handleDragLeave = () => this.onDragLeave(element);
    const handleDrop = (e: DragEvent) => this.onDrop(e, element, targetItem);

    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("dragleave", handleDragLeave);
    element.addEventListener("drop", handleDrop);

    this.cleanups.push(() => {
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("dragleave", handleDragLeave);
      element.removeEventListener("drop", handleDrop);
    });
  }

  getParentId(item: DraggableItemModel): string {
    return isFileModel(item) ? item.folderId : item.parentId;
  }

  private onDragStart(
    e: DragEvent,
    el: HTMLElement,
    item: DraggableItemModel,
  ): void {
    this.dragState.draggedItem = item;
    this.dragState.previousParentId = this.getParentId(item);

    e.dataTransfer!.effectAllowed = "move";
    e.dataTransfer!.setData("text/plain", item.id);
    el.classList.add("dragging");
  }

  private onDragEnd(el: HTMLElement): void {
    el.classList.remove("dragging");
    document
      .querySelectorAll(".drag-over")
      .forEach((f) => f.classList.remove("drag-over"));
  }

  private onDragOver(e: DragEvent, el: HTMLElement): void {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    el.classList.add("drag-over");
  }

  private onDragLeave(el: HTMLElement): void {
    el.classList.remove("drag-over");
  }

  private async onDrop(
    e: DragEvent,
    el: HTMLElement,
    target: FolderModel,
  ): Promise<void> {
    e.preventDefault();
    el.classList.remove("drag-over");

    const { draggedItem } = this.dragState;
    if (!draggedItem || draggedItem.id === target.id) return;

    if (this.isDescendant(draggedItem.id, target.id)) {
      console.warn("Tidak bisa memindahkan folder ke dalam dirinya sendiri");
      return;
    }

    this.updateParent(draggedItem.id, target.id);

    const success = await this.moveItem(draggedItem.id, target.id);
    if (!success) this.revertMove();
  }

  private updateParent(itemId: string, newParentId: string): void {
    const item = this.items.get(itemId);
    if (!item) return;

    if (isFileModel(item)) {
      item.folderId = newParentId;
    } else if (isFolderModel(item)) {
      item.parentId = newParentId;
    }

    this.items.set(itemId, item);
  }

  private revertMove(): void {
    const { draggedItem, previousParentId } = this.dragState;
    if (draggedItem && previousParentId) {
      this.updateParent(draggedItem.id, previousParentId);
      console.warn("Move gagal, posisi dikembalikan");
    }
  }

  private isDescendant(parentId: string, targetId: string): boolean {
    const target = this.items.get(targetId);
    if (!target) return false;

    const targetParentId = this.getParentId(target);
    if (targetParentId === parentId) return true;
    if (targetParentId === null) return false;

    return this.isDescendant(parentId, targetParentId);
  }

  private async moveItem(itemId: string, targetFolderId: string) {
    try {
      const res = await api.patch<ApiResponse<FileModel>>(
        `${this.apiBase}/file/move`,
        {
          fileId: itemId,
          newFolderId: targetFolderId,
        },
      );

      toast.success(res.message);
      return true;
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to add to favourites";

      toast.error(message ?? "Failed to add to favourites");
      return false;
    }
  }

  destroy(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }

    this.cleanups = [];
    this.items.clear();
    this.dragState = {
      draggedItem: null,
      previousParentId: null,
    };
  }
}

export default ItemManager;
