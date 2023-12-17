import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface Props {
  onUpdate: (files: any) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  type: string;
}
const Uploader = ({
  onUpdate,
  allowMultiple,
  maxFiles,
  acceptedFileTypes,
  type,
}: Props) => {
  const url = "http://localhost:8000/api/upload";
  return (
    <FilePond
      onupdatefiles={onUpdate}
      allowMultiple={allowMultiple}
      maxFiles={maxFiles}
      server={{
        url,
        process: {
          url: "/process",
          method: "POST",
          withCredentials: true,
          headers: {
            "file-type": type,
          },
        },
        revert: {
          url: "/revert",
          method: "POST",
          withCredentials: true,
          headers: {
            "file-type": type,
          },
        },
      }}
      name="file"
      labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      acceptedFileTypes={acceptedFileTypes}
    />
  );
};

export default Uploader;
