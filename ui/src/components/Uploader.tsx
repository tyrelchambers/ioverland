import React, { useEffect } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePondInitialFile } from "filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import { env } from "next-runtime-env";
import { useAuth } from "@clerk/nextjs";

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
  disabled?: boolean;
}
const Uploader = ({
  onUpdate,
  allowMultiple,
  maxFiles,
  acceptedFileTypes,
  type,
  files,
  maxFileSize,
  disabled,
}: Props) => {
  const { userId } = useAuth();
  const url = `${env("NEXT_PUBLIC_BACKEND_URL")}/api/upload`;

  return (
    <FilePond
      {...(files && { files })}
      onupdatefiles={onUpdate}
      allowMultiple={allowMultiple}
      maxFiles={maxFiles}
      maxFileSize={maxFileSize}
      chunkUploads={true}
      chunkForce={true}
      server={{
        url,
        process: {
          url: "/process",
          method: "POST",
          headers: {
            "file-type": type,
            "clerk-user-id": userId ?? "",
          },
        },
        headers: {
          "clerk-user-id": userId ?? "",
        },
        revert: {
          url: "/revert",
          method: "POST",
          headers: {
            "file-type": type,
            "clerk-user-id": userId ?? "",
          },
        },
      }}
      name="file"
      labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      acceptedFileTypes={acceptedFileTypes}
      disabled={disabled}
    />
  );
};

export default Uploader;
