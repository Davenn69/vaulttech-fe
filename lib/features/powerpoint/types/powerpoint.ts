export type PowerpointFilePayload = {
  name: string;
  size: number;
  downloadUrl: string;
};

export type PowerpointViewerData = {
  fileName?: string;
  downloadUrl?: string;
  viewerUrl?: string;
};

export type PowerpointViewerProps = {
  id: string;
};
