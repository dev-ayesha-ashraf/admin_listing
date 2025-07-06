import axiosInstance from "../../utils/apiInstance";
interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  folderName?: string;
}

interface ServerResponse {
  success: boolean;
  message: string;
  data: {
    urls: string[];
    files: any[];
  };
}

export async function uploadImage(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folderName", options.folderName || "products");

    const response = await axiosInstance.post<ServerResponse>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success || !response.data.data?.urls?.[0]) {
      throw new Error(response.data.message || "Failed to upload image");
    }

    return response.data.data.urls[0];
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadMultipleImages(
  files: (File | Blob)[],
  options: UploadOptions = {}
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);

    // Filter out any undefined or empty URLs
    const validUrls = results.filter(
      (url) => url && typeof url === "string" && url.trim() !== ""
    );

    if (validUrls.length === 0) {
      throw new Error("No valid image URLs received from server");
    }

    return validUrls;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload images");
  }
}
