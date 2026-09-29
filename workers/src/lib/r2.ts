// Cloudflare R2 helpers — replaces Supabase Storage (client-assets bucket)
// Provides upload, download, delete, and list operations for the R2 bucket

export interface R2UploadOptions {
    key: string;
    body: ReadableStream | ArrayBuffer | Blob | string;
    contentType?: string;
    metadata?: Record<string, string>;
}

export interface R2Object {
    key: string;
    size: number;
    uploaded: string;
    httpMetadata?: { contentType?: string };
    customMetadata?: Record<string, string>;
}

/**
 * Upload a file to R2
 * Key format: {clientId}/{category}/{filename}
 * e.g. "client-uuid/logos/brand.png"
 */
export async function uploadToR2(
    bucket: R2Bucket,
    options: R2UploadOptions
): Promise<string> {
    await bucket.put(options.key, options.body, {
        httpMetadata: { contentType: options.contentType || 'application/octet-stream' },
        customMetadata: { ...options.metadata, uploadedAt: new Date().toISOString() },
    });
    return options.key;
}

/**
 * Get a signed-like URL for an R2 object
 * (CF Workers serve R2 directly at /api/assets/{key})
 */
export function getR2PublicUrl(appUrl: string, key: string): string {
    return `${appUrl}/api/assets/${encodeURIComponent(key)}`;
}

/**
 * List files in a client folder
 */
export async function listClientAssets(
    bucket: R2Bucket,
    clientId: string,
    prefix?: string
): Promise<R2Object[]> {
    const folderPrefix = prefix ? `${clientId}/${prefix}/` : `${clientId}/`;
    const listed = await bucket.list({ prefix: folderPrefix, limit: 100 });

    return listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
        httpMetadata: obj.httpMetadata,
        customMetadata: obj.customMetadata,
    }));
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key);
}
