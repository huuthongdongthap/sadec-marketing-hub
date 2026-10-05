/**
 * Mekong OCOP Network Data
 * Danh bạ 12 Huyện Thành Đồng Tháp & Đối Tác Bản Địa (< 200 dòng/file).
 */
(function() {
  const DISTRICTS = [
    { id: 'all', name: 'Tất Cả 12 Huyện Thành' },
    { id: 'tp-sadec', name: 'TP. Sa Đéc' },
    { id: 'tp-caolanh', name: 'TP. Cao Lãnh' },
    { id: 'tp-hongngu', name: 'TP. Hồng Ngự' },
    { id: 'laivung', name: 'Huyện Lai Vung' },
    { id: 'thapmuoi', name: 'Huyện Tháp Mười' },
    { id: 'tamnong', name: 'Huyện Tam Nông' },
    { id: 'thanhbinh', name: 'Huyện Thanh Bình' },
    { id: 'lapvo', name: 'Huyện Lấp Vò' },
    { id: 'chauthanh', name: 'Huyện Châu Thành' },
    { id: 'tanhong', name: 'Huyện Tân Hồng' },
    { id: 'huyen-caolanh', name: 'Huyện Cao Lãnh' },
    { id: 'huyen-hongngu', name: 'Huyện Hồng Ngự' }
  ];

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Ngành Nghề' },
    { id: 'nong-san', name: 'Nông Sản & Đặc Sản' },
    { id: 'homestay', name: 'Homestay & Sinh Thái' },
    { id: 'lang-nghe', name: 'Làng Nghề & Di Sản' }
  ];

  const PARTNERS = [
    {
      id: 'DT-SD01', name: 'HTX Hoa Kiểng Tân Quy Đông',
      district: 'tp-sadec', districtName: 'TP. Sa Đéc', category: 'lang-nghe',
      ocopRating: 4, product: 'Cúc Mâm Xôi & Hoa Kiểng Công Trình',
      commission: '15% cho Hub', status: 'verified', contact: '0918.234.567',
      address: 'Đường Hoa Sa Đéc, Phường Tân Quy Đông'
    },
    {
      id: 'DT-SD02', name: 'Xưởng Bột Gạo Truyền Thống Sa Đéc',
      district: 'tp-sadec', districtName: 'TP. Sa Đéc', category: 'nong-san',
      ocopRating: 4, product: 'Bột Gạo Lọc & Hủ Tiếu Sa Đéc Khô',
      commission: '20% cho Hub', status: 'verified', contact: '0903.888.777',
      address: 'Làng Bột Tân Phú Đông, TP. Sa Đéc'
    },
    {
      id: 'DT-CL01', name: 'Vườn Xoài Cát Chu Sinh Thái Mỹ Xương',
      district: 'tp-caolanh', districtName: 'TP. Cao Lãnh', category: 'nong-san',
      ocopRating: 4, product: 'Xoài Cát Chu Cây Cổ Thụ & Xoài Sấy Dẻo',
      commission: '15% cho Hub', status: 'verified', contact: '0919.456.123',
      address: 'Xã Mỹ Xương, TP. Cao Lãnh'
    },
    {
      id: 'DT-CL02', name: 'Homestay Ven Sông Rạch Phong Hòa',
      district: 'huyen-caolanh', districtName: 'Huyện Cao Lãnh', category: 'homestay',
      ocopRating: 3, product: 'Lưu Trú Nhà Tre Sinh Thái & Câu Cá Đồng',
      commission: '25% cho Hub', status: 'ready-for-tour', contact: '0988.765.432',
      address: 'Ấp 2, Xã Phong Hòa, Huyện Cao Lãnh'
    },
    {
      id: 'DT-LV01', name: 'Cơ Sở Nem Chua Lai Vung Út Thẳng',
      district: 'laivung', districtName: 'Huyện Lai Vung', category: 'nong-san',
      ocopRating: 4, product: 'Nem Lai Vung Lá Chuối & Bì Nem Chua',
      commission: '15% cho Hub', status: 'verified', contact: '0907.334.556',
      address: 'Thị trấn Lai Vung, Huyện Lai Vung'
    },
    {
      id: 'DT-TM01', name: 'Hợp Tác Xã Sen Tháp Mười',
      district: 'thapmuoi', districtName: 'Huyện Tháp Mười', category: 'nong-san',
      ocopRating: 5, product: 'Trà Hoa Sen Đất Sen Hồng & Hạt Sen Sấy',
      commission: '20% cho Hub', status: 'verified', contact: '0913.999.001',
      address: 'Xã Mỹ Hòa, Huyện Tháp Mười'
    },
    {
      id: 'DT-TN01', name: 'Tràm Chim Eco Lodge & Gạo Huyết Rồng',
      district: 'tamnong', districtName: 'Huyện Tam Nông', category: 'homestay',
      ocopRating: 4, product: 'Tour Vùng Đệm Tràm Chim & Gạo Huyết Rồng',
      commission: '20% cho Hub', status: 'verified', contact: '0939.112.233',
      address: 'Thị trấn Tràm Chim, Huyện Tam Nông'
    },
    {
      id: 'DT-TB01', name: 'Tổ Hợp Tác Ớt Chỉ Thiên Thanh Bình',
      district: 'thanhbinh', districtName: 'Huyện Thanh Bình', category: 'nong-san',
      ocopRating: 3, product: 'Ớt Chỉ Thiên Sấy Khô & Tương Ớt Bản Địa',
      commission: '15% cho Hub', status: 'ready-for-tour', contact: '0918.777.222',
      address: 'Xã Bình Thành, Huyện Thanh Bình'
    },
    {
      id: 'DT-LV02', name: 'Hợp Tác Xã Dệt Chiếu Định Yên',
      district: 'lapvo', districtName: 'Huyện Lấp Vò', category: 'lang-nghe',
      ocopRating: 4, product: 'Chiếu Lác Dệt Hoa Di Sản & Chợ Ma',
      commission: '25% cho Hub', status: 'verified', contact: '0909.555.444',
      address: 'Xã Định Yên, Huyện Lấp Vò'
    },
    {
      id: 'DT-CT01', name: 'Vườn Nhãn Idor & Khoai Lang Phú Hựu',
      district: 'chauthanh', districtName: 'Huyện Châu Thành', category: 'nong-san',
      ocopRating: 3, product: 'Nhãn Xuồng Châu Thành & Rượu Nhãn',
      commission: '15% cho Hub', status: 'ready-for-tour', contact: '0944.332.111',
      address: 'Xã Phú Hựu, Huyện Châu Thành'
    },
    {
      id: 'DT-HN01', name: 'Làng Nghề Dệt Choàng Long Khánh',
      district: 'tp-hongngu', districtName: 'TP. Hồng Ngự', category: 'lang-nghe',
      ocopRating: 4, product: 'Khăn Rằn Dệt Tay Truyền Thống Đất Sen Hồng',
      commission: '25% cho Hub', status: 'verified', contact: '0912.888.666',
      address: 'Cù lao Long Khánh, TP. Hồng Ngự'
    },
    {
      id: 'DT-TH01', name: 'Cơ Sở Nông Nghiệp Sen Bách Diệp',
      district: 'tanhong', districtName: 'Huyện Tân Hồng', category: 'nong-san',
      ocopRating: 3, product: 'Củ Sen Tươi Vùng Biên & Tinh Bột Sen',
      commission: '20% cho Hub', status: 'ready-for-tour', contact: '0932.114.778',
      address: 'Xã Tân Phước, Huyện Tân Hồng'
    }
  ];

  window.MekongOcopData = {
    DISTRICTS,
    CATEGORIES,
    PARTNERS,
    filterPartners: function(districtId, categoryId) {
      return PARTNERS.filter(p => {
        const matchDistrict = !districtId || districtId === 'all' || p.district === districtId;
        const matchCategory = !categoryId || categoryId === 'all' || p.category === categoryId;
        return matchDistrict && matchCategory;
      });
    }
  };
})();
