import { prepareDownloadData } from "./service";

type DownloadHookArgs = {
  data?: Record<string, unknown>;
};

export const downloadHooks = {
  beforeChange: [
    ({ data }: DownloadHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareDownloadData(data);
    },
  ],
};
