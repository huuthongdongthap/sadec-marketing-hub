// ================================================
// MEKONG AGENCY - STORAGE SERVICE
// File Storage & Realtime Subscriptions
// ================================================

import { supabase } from './supabase-client.js';
import { auth } from './auth-service.js';
import { Logger } from '../shared/logger.js';

// ================================================
// ASSETS API (DAM - Digital Asset Management)
// ================================================

export const assets = {
    async getAll(folder = 'all') {
        let query = supabase.from('assets').select('*');
        if (folder !== 'all') {
            query = query.eq('folder', folder);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    async upload(file, folder = 'all', metadata = {}) {
        const user = await auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from('client-assets')
            .upload(filePath, file);

        if (storageError) return { error: storageError };

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('client-assets')
            .getPublicUrl(filePath);

        // 3. Insert into Database
        // Need to fetch client_id for the user first
        const { data: clientData } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single();
        const clientId = clientData?.id;

        const assetRecord = {
            client_id: clientId,
            name: file.name,
            type: getFileType(file.type),
            extension: fileExt,
            url: publicUrl,
            size: file.size,
            folder: folder,
            metadata: metadata,
            uploaded_by: user.id
        };

        const { data: dbData, error: dbError } = await supabase
            .from('assets')
            .insert(assetRecord)
            .select()
            .single();

        if (dbError) return { error: dbError };

        return { data: dbData, error: null };
    },

    async uploadMultiple(files, folder = 'all', metadata = {}) {
        const results = [];
        for (const file of files) {
            const result = await this.upload(file, folder, metadata);
            results.push(result);
        }
        return results;
    },

    async delete(id, url) {
        // 1. Delete from DB
        const { error: dbError } = await supabase.from('assets').delete().eq('id', id);
        if (dbError) return { error: dbError };

        // 2. Delete from Storage (extract path from URL)
        try {
            const urlParts = url.split('/');
            const path = urlParts.slice(-2).join('/');
            await supabase.storage.from('client-assets').remove([path]);
        } catch (e) {
            // Storage delete is optional
            Logger.warn('Storage delete failed', { error: e });
        }

        return { error: null };
    },

    async deleteBatch(ids) {
        const { error } = await supabase
            .from('assets')
            .delete()
            .in('id', ids);
        return { error };
    },

    async updateMetadata(id, metadata) {
        const { data, error } = await supabase
            .from('assets')
            .update({ metadata })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async search(query, filters = {}) {
        let dbQuery = supabase.from('assets').select('*');

        if (query) {
            dbQuery = dbQuery.ilike('name', `%${query}%`);
        }
        if (filters.type) {
            dbQuery = dbQuery.eq('type', filters.type);
        }
        if (filters.folder && filters.folder !== 'all') {
            dbQuery = dbQuery.eq('folder', filters.folder);
        }

        const { data, error } = await dbQuery.order('created_at', { ascending: false });
        return { data, error };
    },

    async getStats() {
        const { data, error } = await supabase.from('assets').select('type, size');

        if (error) return { data: null, error };

        const stats = {
            total: data.length,
            totalSize: data.reduce((sum, a) => sum + (a.size || 0), 0),
            byType: {
                images: data.filter(a => a.type === 'image').length,
                videos: data.filter(a => a.type === 'video').length,
                documents: data.filter(a => a.type === 'document').length,
                other: data.filter(a => a.type === 'other').length
            }
        };

        return { data: stats, error: null };
    }
};

// Helper function to determine file type
function getFileType(mimeType) {
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) return 'document';
    return 'other';
}

// ================================================
// REALTIME SUBSCRIPTIONS
// ================================================

export const realtime = {
    channels: new Map(),

    subscribeToLeads(callback) {
        const channel = supabase
            .channel('leads-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
            .subscribe();

        this.channels.set('leads', channel);
        return channel;
    },

    subscribeToCampaigns(callback) {
        const channel = supabase
            .channel('campaigns-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, callback)
            .subscribe();

        this.channels.set('campaigns', channel);
        return channel;
    },

    subscribeToProjects(callback) {
        const channel = supabase
            .channel('projects-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
            .subscribe();

        this.channels.set('projects', channel);
        return channel;
    },

    subscribeToDeals(callback) {
        const channel = supabase
            .channel('deals-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, callback)
            .subscribe();

        this.channels.set('deals', channel);
        return channel;
    },

    subscribeToInvoices(callback) {
        const channel = supabase
            .channel('invoices-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, callback)
            .subscribe();

        this.channels.set('invoices', channel);
        return channel;
    },

    unsubscribe(channelName) {
        const channel = this.channels.get(channelName);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(channelName);
        }
    },

    unsubscribeAll() {
        this.channels.forEach((channel, name) => {
            supabase.removeChannel(channel);
        });
        this.channels.clear();
    },

    isSubscribed(channelName) {
        return this.channels.has(channelName);
    }
};

// ================================================
// WORKFLOW AUTOMATION API
// ================================================

export const automation = {
    async getWorkflows() {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .order('name');
        return { data, error };
    },

    async getWorkflowById(id) {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async executeWorkflow(workflowId, context = {}) {
        const { data, error } = await supabase
            .from('workflow_executions')
            .insert({
                workflow_id: workflowId,
                status: 'running',
                context,
                current_step_index: 0
            })
            .select()
            .single();

        // In a real system, this would trigger an Edge Function or background worker
        // For now, we just create the execution record
        return { data, error };
    },

    async getExecutions(workflowId = null) {
        let query = supabase.from('workflow_executions').select('*, workflow:workflows(name)');
        if (workflowId) query = query.eq('workflow_id', workflowId);

        const { data, error } = await query.order('started_at', { ascending: false });
        return { data, error };
    },

    async updateExecutionStatus(executionId, status, output = {}) {
        const { data, error } = await supabase
            .from('workflow_executions')
            .update({ status, output, completed_at: new Date().toISOString() })
            .eq('id', executionId)
            .select()
            .single();
        return { data, error };
    }
};

// ================================================
// FILE UTILITIES
// ================================================

export const fileUtils = {
    // Format file size to human-readable format
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    },

    // Get file extension from name
    getExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    },

    // Validate file type
    isValidType(file, allowedTypes) {
        const type = getFileType(file.type);
        return allowedTypes.includes(type) || allowedTypes.includes(file.type);
    },

    // Validate file size
    isValidSize(file, maxSizeBytes) {
        return file.size <= maxSizeBytes;
    },

    // Create file preview URL
    async createPreview(file) {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null;
    },

    // Download file from URL
    async download(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            Logger.error('Download failed', { error });
            throw error;
        }
    }
};

// ================================================
// EXPORT DEFAULT
// ================================================

export default {
    assets,
    realtime,
    automation,
    fileUtils
};
