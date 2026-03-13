#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
ACCESSIBILITY FIX SCRIPT - Sa Đéc Marketing Hub
═══════════════════════════════════════════════════════════════════════════
Script tự động thêm aria-labels cho icon buttons và form inputs

Usage:
    python3 scripts/a11y/fix-accessibility.py [target_dir]

Example:
    python3 scripts/a11y/fix-accessibility.py admin/
    python3 scripts/a11y/fix-accessibility.py portal/
"""

import os
import re
import sys
from pathlib import Path

# Mapping từ icon name → aria-label tiếng Việt
ICON_LABELS = {
    'search': 'Tìm kiếm',
    'notifications': 'Thông báo',
    'account_circle': 'Tài khoản',
    'settings': 'Cài đặt',
    'home': 'Trang chủ',
    'dashboard': 'Bảng điều khiển',
    'people': 'Khách hàng',
    'campaign': 'Chiến dịch',
    'email': 'Email',
    'analytics': 'Phân tích',
    'report': 'Báo cáo',
    'add': 'Thêm mới',
    'edit': 'Chỉnh sửa',
    'delete': 'Xóa',
    'close': 'Đóng',
    'check': 'Xác nhận',
    'arrow_back': 'Quay lại',
    'arrow_forward': 'Chuyển tiếp',
    'arrow_downward': 'Xuống dưới',
    'arrow_upward': 'Lên trên',
    'menu': 'Menu',
    'more_vert': 'Thêm tùy chọn',
    'more_horiz': 'Thêm tùy chọn',
    'refresh': 'Làm mới',
    'upload': 'Tải lên',
    'download': 'Tải xuống',
    'file_download': 'Tải xuống',
    'file_upload': 'Tải lên',
    'visibility': 'Xem',
    'visibility_off': 'Ẩn',
    'favorite': 'Yêu thích',
    'star': 'Đánh giá',
    'star_border': 'Chưa đánh giá',
    'thumb_up': 'Thích',
    'thumb_down': 'Không thích',
    'share': 'Chia sẻ',
    'print': 'In',
    'save': 'Lưu',
    'cancel': 'Hủy',
    'check_circle': 'Hoàn thành',
    'error': 'Lỗi',
    'warning': 'Cảnh báo',
    'info': 'Thông tin',
    'help': 'Trợ giúp',
    'light_mode': 'Chế độ sáng',
    'dark_mode': 'Chế độ tối',
    'language': 'Ngôn ngữ',
    'logout': 'Đăng xuất',
    'login': 'Đăng nhập',
    'person_add': 'Thêm người dùng',
    'group': 'Nhóm',
    'calendar_today': 'Lịch',
    'event': 'Sự kiện',
    'schedule': 'Lịch trình',
    'history': 'Lịch sử',
    'trending_up': 'Xu hướng tăng',
    'trending_down': 'Xu hướng giảm',
    'attach_file': 'Đính kèm',
    'link': 'Liên kết',
    'content_copy': 'Sao chép',
    'content_cut': 'Cắt',
    'content_paste': 'Dán',
    'undo': 'Hoàn tác',
    'redo': 'Làm lại',
    'zoom_in': 'Phóng to',
    'zoom_out': 'Thu nhỏ',
    'filter_list': 'Bộ lọc',
    'sort': 'Sắp xếp',
    'view_list': 'Xem danh sách',
    'view_module': 'Xem dạng lưới',
    'grid_view': 'Xem dạng lưới',
    'expand_more': 'Mở rộng',
    'expand_less': 'Thu gọn',
    'chevron_left': 'Trái',
    'chevron_right': 'Phải',
    'chevron_up': 'Lên',
    'chevron_down': 'Xuống',
    'fast_forward': 'Chuyển nhanh',
    'fast_rewind': 'Lùi nhanh',
    'play_arrow': 'Phát',
    'pause': 'Tạm dừng',
    'stop': 'Dừng',
    'record_voice_over': 'Ghi âm',
    'mic': 'Micro',
    'mic_off': 'Tắt micro',
    'volume_up': 'Tăng âm lượng',
    'volume_down': 'Giảm âm lượng',
    'volume_off': 'Tắt âm',
    'phone': 'Gọi điện',
    'phone_in_talk': 'Đang gọi',
    'mail': 'Email',
    'markunread': 'Đánh dấu chưa đọc',
    'lock': 'Khóa',
    'lock_open': 'Mở khóa',
    'security': 'Bảo mật',
    'verified': 'Đã xác minh',
    'shopping_cart': 'Giỏ hàng',
    'credit_card': 'Thẻ thanh toán',
    'payment': 'Thanh toán',
    'monetization_on': 'Doanh thu',
    'account_balance': 'Số dư',
}

# Mapping từ input id/type → aria-label
INPUT_LABELS = {
    'search': 'Tìm kiếm',
    'email': 'Email',
    'password': 'Mật khẩu',
    'name': 'Tên',
    'username': 'Tên đăng nhập',
    'phone': 'Số điện thoại',
    'address': 'Địa chỉ',
    'company': 'Công ty',
    'message': 'Nội dung',
    'description': 'Mô tả',
    'title': 'Tiêu đề',
    'subject': 'Chủ đề',
    'content': 'Nội dung',
}


def add_aria_label_to_icon_buttons(html_content, filename):
    """Thêm aria-label cho icon buttons (material-symbols-outlined)."""
    fixed_count = 0

    # Pattern 1: Icon trong button
    # <button ...><span class="material-symbols-outlined">icon_name</span></button>
    def replace_button_icon(match):
        nonlocal fixed_count
        button_content = match.group(0)
        icon_match = re.search(r'<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>([^<]+)</span>', button_content)

        if icon_match:
            icon_name = icon_match.group(1).strip()
            label = ICON_LABELS.get(icon_name, icon_name.replace('_', ' ').title())

            # Check nếu chưa có aria-label
            if 'aria-label' not in button_content:
                # Thêm aria-label vào button
                fixed_button = re.sub(
                    r'<button([^>]*)>',
                    rf'<button\1 aria-label="{label}"',
                    button_content,
                    count=1,
                    flags=re.IGNORECASE
                )
                fixed_count += 1
                return fixed_button

        return button_content

    button_pattern = r'<button[^>]*>[\s\n]*<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>[^<]+</span>[\s\n]*</button>'
    html_content = re.sub(button_pattern, replace_button_icon, html_content, flags=re.IGNORECASE | re.DOTALL)

    # Pattern 2: Icon trong a tag
    def replace_link_icon(match):
        nonlocal fixed_count
        link_content = match.group(0)
        icon_match = re.search(r'<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>([^<]+)</span>', link_content)

        if icon_match:
            icon_name = icon_match.group(1).strip()
            label = ICON_LABELS.get(icon_name, icon_name.replace('_', ' ').title())

            if 'aria-label' not in link_content:
                fixed_link = re.sub(
                    r'<a([^>]*)>',
                    rf'<a\1 aria-label="{label}"',
                    link_content,
                    count=1,
                    flags=re.IGNORECASE
                )
                fixed_count += 1
                return fixed_link

        return link_content

    link_pattern = r'<a[^>]*>[\s\n]*<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>[^<]+</span>[\s\n]*</a>'
    html_content = re.sub(link_pattern, replace_link_icon, html_content, flags=re.IGNORECASE | re.DOTALL)

    # Pattern 3: Standalone icon spans (không trong button/a)
    def replace_standalone_icon(match):
        nonlocal fixed_count
        icon_content = match.group(0)
        icon_name = match.group(1).strip()

        if 'aria-label' not in icon_content and 'aria-hidden' not in icon_content:
            label = ICON_LABELS.get(icon_name, icon_name.replace('_', ' ').title())
            # Thêm aria-label và role
            fixed_icon = icon_content.replace(
                f'>{icon_name}<',
                f' aria-label="{label}" role="img">{icon_name}<'
            )
            fixed_count += 1
            return fixed_icon

        return icon_content

    standalone_pattern = r'<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>([^<]+)</span>'
    html_content = re.sub(standalone_pattern, replace_standalone_icon, html_content, flags=re.IGNORECASE)

    return html_content, fixed_count


def add_labels_to_inputs(html_content, filename):
    """Thêm aria-label cho form inputs."""
    fixed_count = 0

    def replace_input(match):
        nonlocal fixed_count
        input_content = match.group(0)

        # Skip nếu đã có aria-label
        if 'aria-label' in input_content:
            return input_content

        # Tìm id hoặc type để xác định label
        id_match = re.search(r'id="([^"]+)"', input_content)
        type_match = re.search(r'type="([^"]+)"', input_content)
        name_match = re.search(r'name="([^"]+)"', input_content)
        placeholder_match = re.search(r'placeholder="([^"]+)"', input_content)

        label = None

        # Ưu tiên theo thứ tự: id → name → type → placeholder
        if id_match:
            input_id = id_match.group(1).lower()
            for key, value in INPUT_LABELS.items():
                if key in input_id:
                    label = value
                    break

        if not label and name_match:
            input_name = name_match.group(1).lower()
            for key, value in INPUT_LABELS.items():
                if key in input_name:
                    label = value
                    break

        if not label and type_match:
            input_type = type_match.group(1).lower()
            label = INPUT_LABELS.get(input_type)

        if not label and placeholder_match:
            label = placeholder_match.group(1)

        if label:
            # Thêm aria-label trước dấu > cuối cùng
            fixed_input = re.sub(
                r'([^>]+)>',
                rf'\1 aria-label="{label}">',
                input_content,
                count=1
            )
            fixed_count += 1
            return fixed_input

        return input_content

    input_pattern = r'<input[^>]*>'
    html_content = re.sub(input_pattern, replace_input, html_content, flags=re.IGNORECASE)

    return html_content, fixed_count


def add_aria_hidden_to_decorative_icons(html_content, filename):
    """Thêm aria-hidden cho decorative icons không cần thiết."""
    fixed_count = 0

    def replace_icon(match):
        nonlocal fixed_count
        icon_content = match.group(0)

        # Nếu đã có aria-label hoặc aria-hidden, giữ nguyên
        if 'aria-label' in icon_content or 'aria-hidden' in icon_content:
            return icon_content

        # Thêm aria-hidden="true"
        fixed_icon = re.sub(
            r'<span([^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*)>',
            r'<span\1 aria-hidden="true">',
            icon_content,
            count=1,
            flags=re.IGNORECASE
        )
        fixed_count += 1
        return fixed_icon

    standalone_pattern = r'<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>[^<]+</span>'
    html_content = re.sub(standalone_pattern, replace_icon, html_content, flags=re.IGNORECASE)

    return html_content, fixed_count


def fix_accessibility(file_path):
    """Fix accessibility issues cho một file HTML."""
    print(f"Đang xử lý: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    original_content = html_content
    total_fixed = 0

    # Fix 1: Thêm aria-label cho icon buttons
    html_content, count = add_aria_label_to_icon_buttons(html_content, file_path)
    print(f"  ✓ Added {count} aria-labels cho icon buttons")
    total_fixed += count

    # Fix 2: Thêm aria-label cho form inputs
    html_content, count = add_labels_to_inputs(html_content, file_path)
    print(f"  ✓ Added {count} aria-labels cho inputs")
    total_fixed += count

    # Fix 3: Thêm aria-hidden cho decorative icons
    html_content, count = add_aria_hidden_to_decorative_icons(html_content, file_path)
    print(f"  ✓ Added {count} aria-hidden cho decorative icons")
    total_fixed += count

    # Chỉ ghi file nếu có thay đổi
    if html_content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"  ✅ Đã lưu {file_path}")
    else:
        print(f"  → Không có thay đổi")

    return total_fixed


def main():
    """Main function."""
    if len(sys.argv) < 2:
        target_dir = 'admin'
    else:
        target_dir = sys.argv[1]

    if not os.path.isdir(target_dir):
        print(f"Lỗi: Thư mục '{target_dir}' không tồn tại")
        sys.exit(1)

    print(f"═══════════════════════════════════════════════════════════")
    print(f"ACCESSIBILITY FIX SCRIPT")
    print(f"═══════════════════════════════════════════════════════════")
    print(f"Thư mục: {target_dir}")
    print(f"")

    total_fixed = 0
    files_processed = 0

    # Tìm tất cả file HTML
    for root, dirs, files in os.walk(target_dir):
        # Skip node_modules và các thư mục không cần thiết
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]

        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                fixed = fix_accessibility(file_path)
                total_fixed += fixed
                files_processed += 1

    print(f"")
    print(f"═══════════════════════════════════════════════════════════")
    print(f"TỔNG KẾT")
    print(f"═══════════════════════════════════════════════════════════")
    print(f"Files đã xử lý: {files_processed}")
    print(f"Tổng fixes: {total_fixed}")
    print(f"")


if __name__ == '__main__':
    main()
