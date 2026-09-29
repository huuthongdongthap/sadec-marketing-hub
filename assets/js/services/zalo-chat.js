/**
 * Zalo OA Chat Interface Logic
 * Handles mock messaging and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('sendBtn');
    const msgInput = document.getElementById('msgInput');

    if (sendBtn && msgInput) {
        sendBtn.addEventListener('click', sendMessage);
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

function sendMessage() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text) return;

    // Add Outbound Message
    addMessage(text, 'outbound');
    input.value = '';

    // Simulate Reply (Mock Mode)
    setTimeout(() => {
        addMessage('Đây là phản hồi tự động từ hệ thống (Mock Mode)', 'inbound');
    }, 1000);
}

function addMessage(text, type) {
    const list = document.getElementById('messageList');
    if (!list) return;

    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    msg.innerHTML = `${text}<span class="message-time">${time}</span>`;

    list.appendChild(msg);
    list.scrollTop = list.scrollHeight;
}
