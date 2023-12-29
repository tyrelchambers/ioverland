import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePondInitialFile } from "filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

interface Props {
  onUpdate: (files: any) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  type: string;
  files?: (string | FilePondInitialFile | Blob | File)[];
  maxFileSize?: string;
}
const Uploader = ({
  onUpdate,
  allowMultiple,
  maxFiles,
  acceptedFileTypes,
  type,
  files,
  maxFileSize,
}: Props) => {
  const url = "http://localhost:8000/api/upload";
  return (
    <FilePond
      {...(files && { files })}
      onupdatefiles={onUpdate}
      allowMultiple={allowMultiple}
      maxFiles={maxFiles}
      maxFileSize={maxFileSize}
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
