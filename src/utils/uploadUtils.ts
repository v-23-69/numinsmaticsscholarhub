
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to a specified Supabase Storage bucket.
 * @param file The file object to upload.
 * @param bucket The storage bucket name (e.g., 'coins', 'avatars', 'stories').
 * @param folder Optional folder path within the bucket.
 * @returns The public URL of the uploaded file or null on error.
 */
export const uploadImage = async (
    file: File,
    bucket: string,
    folder: string = ''
): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Unexpected error during upload:', error);
        return null;
    }
};

/**
 * Uploads multiple files to Supabase Storage.
 */
export const uploadImages = async (
    files: File[],
    bucket: string,
    folder: string = ''
): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImage(file, bucket, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
};
