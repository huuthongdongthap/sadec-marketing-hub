// ================================================
// MEKONG AGENCY - SUPABASE CLIENT (LEGACY COMPAT)
// Backward Compatibility Layer
// ================================================

/**
 * This file provides backward compatibility for code that imports
 * directly from supabase.js. New code should import from modular services:
 *
 *   import { auth } from './core/auth-service.js';
 *   import { leads, clients } from './core/database-service.js';
 *   import { assets } from './core/storage-service.js';
 */

// Re-export everything from modular services
export * from './core/auth-service.js';
export * from './core/database-service.js';
export * from './core/storage-service.js';

// Also export default for backward compat with: import supabase from './supabase.js'
import { getSupabaseClient } from './core/supabase-client.js';
export default getSupabaseClient();
