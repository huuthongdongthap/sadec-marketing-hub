/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEB SHARE API — SA ĐÉC MARKETING HUB
 * Chia sẻ nội dung qua Web Share API
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';
import { copyToClipboard } from './clipboard.js';

/**
 * Share data using Web Share API
 * @param {Object} shareData
 * @param {string} shareData.title - Title to share
 * @param {string} shareData.text - Text to share
 * @param {string} shareData.url - URL to share
 * @returns {Promise<boolean>} Success status
 */
export async function share(shareData) {
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            Logger.info('[Share] Shared via Web Share API');
            return true;
        } else {
            // Fallback: copy URL to clipboard
            Logger.info('[Share] Web Share not supported, fallback to clipboard');
            if (shareData.url) {
                await copyToClipboard(shareData.url, {
                    successMessage: 'Đã sao chép link để chia sẻ!'
                });
            }
            return true;
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            Logger.info('[Share] Share aborted by user');
            return false;
        }
        Logger.error('[Share] Share failed:', err);
        return false;
    }
}

/**
 * Share current page
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export async function sharePage(options = {}) {
    const {
        title = document.title,
        text = document.querySelector('meta[name="description"]')?.content || '',
        url = window.location.href
    } = options;

    return share({ title, text, url });
}

/**
 * Bind share buttons
 * @param {string} selector - Button selector
 * @param {(el: Element) => Object} getData - Get share data from element
 */
export function bindShareButtons(selector, getData) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            const data = getData(el);
            await share(data);
        });
    });
}

/**
 * Check if Web Share API is supported
 * @returns {boolean}
 */
export function isSupported() {
    return !!navigator.share;
}

/**
 * Share with fallback modal
 * @param {Object} shareData
 */
export async function shareWithModal(shareData) {
    if (navigator.share) {
        return share(shareData);
    }

    // Show custom share modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-backdrop"></div>
        <div class="share-modal-content">
            <h3>Chia sẻ</h3>
            <div class="share-options">
                <button class="share-option" data-action="copy">
                    <span class="material-symbols-outlined">content_copy</span>
                    <span>Sao chép link</span>
                </button>
                <button class="share-option" data-action="facebook">
                    <span class="material-symbols-outlined">share</span>
                    <span>Facebook</span>
                </button>
                <button class="share-option" data-action="zalo">
                    <span class="material-symbols-outlined">chat</span>
                    <span>Zalo</span>
                </button>
            </div>
            <button class="share-modal-close">Đóng</button>
        </div>
    `;

    const styles = `
        .share-modal {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .share-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.5);
        }
        .share-modal-content {
            position: relative;
            background: white;
            padding: 24px;
            border-radius: 16px;
            min-width: 300px;
            animation: modalSlideUp 0.3s ease;
        }
        .share-options {
            display: grid;
            gap: 12px;
            margin: 20px 0;
        }
        .share-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: white;
            cursor: pointer;
        }
        .share-modal-close {
            width: 100%;
            padding: 12px;
            border: none;
            background: #f5f5f5;
            border-radius: 8px;
            cursor: pointer;
        }
        @keyframes modalSlideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    document.body.appendChild(modal);

    // Handle share options
    const url = shareData.url || window.location.href;

    modal.querySelector('[data-action="copy"]')?.addEventListener('click', async () => {
        await copyToClipboard(url);
        modal.remove();
    });

    modal.querySelector('[data-action="facebook"]')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        modal.remove();
    });

    modal.querySelector('[data-action="zalo"]')?.addEventListener('click', () => {
        window.open(`https://socialplugins.zalo.me/share?url=${encodeURIComponent(url)}`, '_blank');
        modal.remove();
    });

    modal.querySelector('.share-modal-close')?.addEventListener('click', () => {
        modal.remove();
    });

    modal.querySelector('.share-modal-backdrop')?.addEventListener('click', () => {
        modal.remove();
    });

    return true;
}
