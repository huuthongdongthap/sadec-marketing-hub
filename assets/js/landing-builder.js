/**
 * Landing Page Builder Logic
 * Handles Drag & Drop, Block Selection, and Properties
 */

// Global state or configuration could go here if needed
let currentDevice = 'desktop';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize device toggles
    setupDeviceToggles();
});

// --- Drag and Drop Logic ---

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("type", ev.target.dataset.type);
}

function drop(ev) {
    ev.preventDefault();
    const type = ev.dataTransfer.getData("type");
    addBlock(type);
}

function addBlock(type) {
    const canvas = document.getElementById('canvas');

    // Remove empty placeholder if exists
    if (canvas.children[0] && canvas.children[0].textContent.includes('Kéo thả')) {
        canvas.innerHTML = '';
    }

    const block = document.createElement('div');
    block.className = 'canvas-block';
    block.onclick = (e) => selectBlock(e, block);

    // Generate Block Content based on Type
    block.innerHTML = getBlockTemplate(type);

    canvas.appendChild(block);
}

function selectBlock(e, block) {
    e.stopPropagation();
    document.querySelectorAll('.canvas-block').forEach(b => b.classList.remove('selected'));
    block.classList.add('selected');

    const propPanel = document.getElementById('block-properties');
    if (propPanel) {
        propPanel.style.display = 'block';

        // Bind properties (mock implementation)
        const heading = block.querySelector('h1, h2, h3');
        const headingInput = document.getElementById('prop-heading');
        if(heading && headingInput) {
            headingInput.value = heading.innerText;
            // Simple 1-way binding for demo: update block when input changes
            headingInput.oninput = () => { heading.innerText = headingInput.value; };
        }
    }
}

function getBlockTemplate(type) {
    const actions = `
        <div class="block-actions">
            <button class="btn-icon small"><span class="material-symbols-outlined">arrow_upward</span></button>
            <button class="btn-icon small"><span class="material-symbols-outlined">arrow_downward</span></button>
            <button class="btn-icon small" onclick="this.closest('.canvas-block').remove()"><span class="material-symbols-outlined">delete</span></button>
        </div>
    `;

    switch(type) {
        case 'hero':
            return `
                ${actions}
                <div style="text-align: center; padding: 40px 20px; background: #f8f9fa;">
                    <h1 style="font-size: 32px; margin-bottom: 16px; color: #333;">Tiêu đề chính ấn tượng</h1>
                    <p style="font-size: 18px; color: #666; max-width: 600px; margin: 0 auto 24px;">Mô tả ngắn gọn về giá trị sản phẩm/dịch vụ của bạn tại đây.</p>
                    <button class="btn btn-filled">Đăng ký ngay</button>
                </div>
            `;
        case 'features':
            return `
                ${actions}
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 32px; color: var(--md-sys-color-primary);">★</div>
                        <h3>Tính năng 1</h3>
                        <p>Mô tả tính năng</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; color: var(--md-sys-color-primary);">★</div>
                        <h3>Tính năng 2</h3>
                        <p>Mô tả tính năng</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; color: var(--md-sys-color-primary);">★</div>
                        <h3>Tính năng 3</h3>
                        <p>Mô tả tính năng</p>
                    </div>
                </div>
            `;
        case 'form':
            return `
                ${actions}
                <div style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
                    <h3 style="text-align: center; margin-bottom: 16px;">Đăng ký tư vấn</h3>
                    <input type="text" placeholder="Họ tên" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="text" placeholder="Số điện thoại" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button class="btn btn-filled" style="width: 100%;">Gửi thông tin</button>
                </div>
            `;
        case 'content':
            return `${actions}<div style="padding: 20px;"><h3>Nội dung bài viết</h3><p>Lorem ipsum dolor sit amet...</p></div>`;
        case 'cta':
            return `${actions}<div style="padding: 40px; text-align: center; background: var(--md-sys-color-primary-container);"><h2>Hành động ngay!</h2><button class="btn btn-filled">Mua ngay</button></div>`;
        case 'testimonials':
            return `${actions}<div style="padding: 20px; text-align: center;"><i>"Dịch vụ tuyệt vời!"</i> - Khách hàng A</div>`;
        default:
            return `${actions}<div>Block content placeholder</div>`;
    }
}

// --- Device Switching ---

function setupDeviceToggles() {
    // Expose setDevice globally or attach listeners here if not using inline onclick
    window.setDevice = setDevice;
}

function setDevice(device) {
    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));

    // Find the button that was clicked or corresponds to the device
    const btn = document.querySelector(`.device-btn[onclick="setDevice('${device}')"]`);
    if(btn) btn.classList.add('active');

    const canvas = document.getElementById('canvas');
    if(canvas) {
        canvas.className = `canvas ${device}`;
    }
    currentDevice = device;
}

// Export functions for global usage if needed (for inline HTML handlers)
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
