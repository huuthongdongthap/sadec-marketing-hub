/**
 * Mekong OCOP Network Data - Tỉnh Đồng Tháp (Cập nhật sau sắp xếp không gian đô thị 2026)
 * Danh bạ Đô Thị & Vùng Sinh Thái Kinh Tế OCOP Đồng Tháp (< 200 dòng/file).
 */
(function() {
  const REGIONS = [
    { id: 'all', name: 'Toàn Tỉnh Đồng Tháp' },
    { id: 'tp-caolanh', name: 'TP. Cao Lãnh' },
    { id: 'tp-sadec', name: 'TP. Sa Đéc' },
    { id: 'tp-hongngu', name: 'TP. Hồng Ngự' },
    { id: 'laivung', name: 'Đô thị Lai Vung' },
    { id: 'thapmuoi', name: 'Đô thị Tháp Mười' },
    { id: 'tamnong', name: 'Đô thị Tam Nông' },
    { id: 'lapvo', name: 'Đô thị Lấp Vò' },
    { id: 'chauthanh', name: 'Đô thị Châu Thành' },
    { id: 'thanhbinh', name: 'Đô thị Thanh Bình' },
    { id: 'tanhong', name: 'Đô thị Tân Hồng' },
    { id: 'vung-caolanh', name: 'Vùng Mở Rộng Cao Lãnh' },
    { id: 'vung-hongngu', name: 'Vùng Kinh Tế Hồng Ngự' }
  ];

  const DISTRICTS = REGIONS;

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Ngành Nghề' },
    { id: 'nong-san', name: 'Nông Sản & Đặc Sản OCOP' },
    { id: 'homestay', name: 'Homestay & Du Lịch Sinh Thái' },
    { id: 'lang-nghe', name: 'Làng Nghề & Di Sản Bản Địa' }
  ];

  const PARTNERS = [
    {
      id: 'DT-SD01', name: 'HTX Hoa Kiểng Tân Quy Đông',
      district: 'tp-sadec', districtName: 'TP. Sa Đéc', category: 'lang-nghe',
      ocopRating: 4, product: 'Cúc Mâm Xôi & Hoa Kiểng Công Trình Di Sản',
      commission: '15% cho Hub', status: 'verified', contact: '0918.234.567',
      address: 'Đường Hoa Sa Đéc, Phường Tân Quy Đông, TP. Sa Đéc'
    },
    {
      id: 'DT-SD02', name: 'Xưởng Bột Gạo Lọc Sa Đéc Truyền Thống',
      district: 'tp-sadec', districtName: 'TP. Sa Đéc', category: 'nong-san',
      ocopRating: 4, product: 'Bột Gạo Lọc Tinh Chế & Hủ Tiếu Sa Đéc Khô',
      commission: '20% cho Hub', status: 'verified', contact: '0903.888.777',
      address: 'Làng Bột Tân Phú Đông, TP. Sa Đéc'
    },
    {
      id: 'DT-CL01', name: 'HTX Xoài Mỹ Xương - Xoài Cát Chu',
      district: 'tp-caolanh', districtName: 'TP. Cao Lãnh', category: 'nong-san',
      ocopRating: 5, product: 'Xoài Cát Chu Cây Cổ Thụ & Xoài Sấy Dẻo Xuất Khẩu',
      commission: '15% cho Hub', status: 'verified', contact: '0919.456.123',
      address: 'Xã Mỹ Xương, Vùng Thủ Phủ Xoài TP. Cao Lãnh'
    },
    {
      id: 'DT-CL02', name: 'Homestay Rạch Phong Hòa Ven Sông Tiền',
      district: 'vung-caolanh', districtName: 'Vùng Mở Rộng Cao Lãnh', category: 'homestay',
      ocopRating: 3, product: 'Lưu Trú Nhà Tre Sinh Thái & Trải Nghiệm Miệt Vườn',
      commission: '25% cho Hub', status: 'ready-for-tour', contact: '0988.765.432',
      address: 'Ấp 2, Xã Phong Hòa, Vùng Mở Rộng Cao Lãnh'
    },
    {
      id: 'DT-LV01', name: 'Cơ Sở Nem Chua Lai Vung Út Thẳng',
      district: 'laivung', districtName: 'Đô thị Lai Vung', category: 'nong-san',
      ocopRating: 4, product: 'Nem Lai Vung Lá Chuối & Bì Nem Chua Truyền Thống',
      commission: '15% cho Hub', status: 'verified', contact: '0907.334.556',
      address: 'Đô thị Lai Vung, Tỉnh Đồng Tháp'
    },
    {
      id: 'DT-TM01', name: 'Hợp Tác Xã Sen Tháp Mười (Ecolotus)',
      district: 'thapmuoi', districtName: 'Đô thị Tháp Mười', category: 'nong-san',
      ocopRating: 5, product: 'Trà Hoa Sen Đất Sen Hồng 5★ & Hạt Sen Sấy Thăng Hoa',
      commission: '20% cho Hub', status: 'verified', contact: '0913.999.001',
      address: 'Xã Mỹ Hòa, Đô thị Tháp Mười'
    },
    {
      id: 'DT-TN01', name: 'Tràm Chim Eco Lodge & HTX Gạo Huyết Rồng',
      district: 'tamnong', districtName: 'Đô thị Tam Nông', category: 'homestay',
      ocopRating: 4, product: 'Tour Vườn Quốc Gia Tràm Chim & Gạo Huyết Rồng ST',
      commission: '20% cho Hub', status: 'verified', contact: '0939.112.233',
      address: 'Đô thị Tràm Chim, Đô thị Tam Nông'
    },
    {
      id: 'DT-TB01', name: 'Hợp Tác Xã Ớt Chỉ Thiên Thanh Bình',
      district: 'thanhbinh', districtName: 'Đô thị Thanh Bình', category: 'nong-san',
      ocopRating: 4, product: 'Ớt Chỉ Thiên Sấy Khô & Tương Ớt Bản Địa Lên Men',
      commission: '15% cho Hub', status: 'ready-for-tour', contact: '0918.777.222',
      address: 'Xã Bình Thành, Đô thị Thanh Bình'
    },
    {
      id: 'DT-LV02', name: 'Hợp Tác Xã Dệt Chiếu Định Yên Di Sản',
      district: 'lapvo', districtName: 'Đô thị Lấp Vò', category: 'lang-nghe',
      ocopRating: 4, product: 'Chiếu Lác Hoa Văn Di Sản Quốc Gia & Tour Chợ Ma',
      commission: '25% cho Hub', status: 'verified', contact: '0909.555.444',
      address: 'Xã Định Yên, Đô thị Lấp Vò'
    },
    {
      id: 'DT-CT01', name: 'Vườn Nhãn Xuồng Idor & Khoai Lang Phú Hựu',
      district: 'chauthanh', districtName: 'Đô thị Châu Thành', category: 'nong-san',
      ocopRating: 4, product: 'Nhãn Xuồng Cơm Vàng & Rượu Nhãn Châu Thành',
      commission: '15% cho Hub', status: 'ready-for-tour', contact: '0944.332.111',
      address: 'Xã Phú Hựu, Đô thị Châu Thành'
    },
    {
      id: 'DT-HN01', name: 'Làng Nghề Dệt Choàng Long Khánh Cù Lao',
      district: 'tp-hongngu', districtName: 'TP. Hồng Ngự', category: 'lang-nghe',
      ocopRating: 4, product: 'Khăn Rằn Nam Bộ Dệt Thủ Công & Đồ Lưu Niệm Đất Sen',
      commission: '25% cho Hub', status: 'verified', contact: '0912.888.666',
      address: 'Cù lao Long Khánh, TP. Hồng Ngự'
    },
    {
      id: 'DT-TH01', name: 'Cơ Sở Nông Nghiệp Biên Giới Tân Hồng',
      district: 'tanhong', districtName: 'Đô thị Tân Hồng', category: 'nong-san',
      ocopRating: 4, product: 'Sen Bách Diệp Vùng Trũng & Tinh Bột Củ Sen Tươi',
      commission: '20% cho Hub', status: 'ready-for-tour', contact: '0932.114.778',
      address: 'Xã Tân Phước, Đô thị Tân Hồng'
    },
    {
      id: 'DT-HN02', name: 'Hợp Tác Xã Nuôi Cá Bè Cửa Khẩu Hồng Ngự',
      district: 'vung-hongngu', districtName: 'Vùng Kinh Tế Hồng Ngự', category: 'nong-san',
      ocopRating: 4, product: 'Cá Tra Phi Lê Chuẩn Xuất Khẩu & Chả Cá Thác Lác',
      commission: '15% cho Hub', status: 'ready-for-tour', contact: '0915.223.344',
      address: 'Thường Thới Tiền, Vùng Kinh Tế Hồng Ngự'
    }
  ];

  window.MekongOcopData = {
    REGIONS,
    DISTRICTS,
    CATEGORIES,
    PARTNERS,
    filterPartners: function(regionId, categoryId) {
      return PARTNERS.filter(p => {
        const matchRegion = !regionId || regionId === 'all' || p.district === regionId;
        const matchCategory = !categoryId || categoryId === 'all' || p.category === categoryId;
        return matchRegion && matchCategory;
      });
    }
  };
})();
