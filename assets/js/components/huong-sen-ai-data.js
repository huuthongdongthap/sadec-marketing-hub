/**
 * Huong Sen AI Data & Dialect Engine (Nam Bộ 2026)
 * Kho từ điển phương ngữ & kịch bản video ngắn OCOP Đồng Tháp (< 200 dòng/file).
 */
(function() {
  const TONE_STYLES = {
    mientay: { id: 'mientay', name: 'Chân Chất Miệt Vườn', icon: 'volunteer_activism', desc: 'Lời thoại ngọt ngào, chất phác, đậm tình làng nghĩa xóm Đất Sen Hồng.' },
    nghenhan: { id: 'nghenhan', name: 'Thơ Mộng Nghệ Nhân', icon: 'spa', desc: 'Cinematic, lắng đọng chiều sâu văn hóa truyền thống trăm năm.' },
    bakhia: { id: 'bakhia', name: 'Hài Hước Ba Khía', icon: 'sentiment_very_satisfied', desc: 'Dí dỏm, giật gân 3s đầu, bắt trend TikTok dễ lan tỏa viral.' }
  };

  const DIALECT_SAMPLE_SCRIPTS = [
    {
      topicId: 'nem-laivung',
      title: 'Ký Sự Nem Chua Lai Vung Chuẩn Vị Gia Truyền',
      product: 'Nem Chua Lai Vung OCOP 4 Sao',
      region: 'Đô thị Lai Vung',
      tones: {
        mientay: {
          hook: 'Nè nè bà con, nhìn cái miếng nem đỏ au lấp lánh hạt tiêu vầy có chịu nổi hông?',
          story: 'Nem xứ Lai Vung tụi tui gói bằng lá chuối xiêm xanh mướt, thịt nạc tươi vừa quết xong là đem trộn liền với bì dai sần sật. Cắn một miếng nó chua thanh, cay nồng đầu lưỡi mà hậu ngọt đầm ấm nghĩa tình sông Tiền.',
          cta: 'Bấm liền vô giỏ hàng hoặc ghé thẳng lò nem Lai Vung thưởng thức nóng hổi nghen!'
        },
        nghenhan: {
          hook: 'Trăm năm một vị chua thanh, giọt mồ hôi đọng trên từng thớ lá chuối quê mình.',
          story: 'Mỗi chiếc nem là sự kết tinh của nắng gió đồng bằng. Nghệ nhân canh từng độ lên men tự nhiên, không hóa chất, giữ trọn vẹn hồn cốt của làng nghề truyền thống Đồng Tháp.',
          cta: 'Liên hệ rước ngay hộp quà OCOP tinh hoa Đất Sen Hồng biếu người thân bạn hữu.'
        },
        bakhia: {
          hook: 'Trời đất ơi! Ăn một miếng nem này là quên luôn lối về Sài Gòn luôn đó đa!',
          story: 'Tưởng nem chua ở đâu cũng giống nhau hả? Sai bét rồi nha! Nem Lai Vung cắn nghe cái sực, cay của ớt hiểm mà thơm nức mũi của tiêu sọ. Ai ăn kiêng coi chừng hao cơm dữ lắm đó!',
          cta: 'Nhấn link dưới màn hình để chốt đơn ngay kẻo cháy hàng đợt Tết này nghen!'
        }
      }
    },
    {
      topicId: 'hoa-sadec',
      title: 'Rạng Đông Làng Hoa Sa Đéc Trăm Năm Khoe Sắc',
      product: 'Cúc Mâm Xôi & Hoa Kiểng Giàn Tre',
      region: 'TP. Sa Đéc',
      tones: {
        mientay: {
          hook: 'Sáng sớm chèo xuồng giữa ngút ngàn giàn hoa, gió thổi mát rười rượi sướng mê tơi!',
          story: 'Bà con Sa Đéc mình trồng hoa trên giàn tre ngập nước, người làm hoa lội nước chăm từng nụ cúc mâm xôi vàng rực. Cả năm gom góp đợi mùa hoa Tết dâng sắc cho đời.',
          cta: 'Về Sa Đéc đặt tour check-in ngay giàn hoa trăm năm cùng ekip quay 4K nhé!'
        },
        nghenhan: {
          hook: 'Khi bình minh dát vàng lên từng giọt sương đọng trên cánh cúc Sa Đéc.',
          story: 'Di sản trăm năm không chỉ nằm ở cây hoa, mà nằm ở đôi bàn tay chai sần kiên nhẫn uốn từng nhành kiểng cổ. Đất và nước sông Tiền dung dưỡng vẻ đẹp thuần khiết phương Nam.',
          cta: 'Đăng ký tour trải nghiệm nghệ nhân hoa kiểng Sa Đéc để lưu giữ thước phim di sản.'
        },
        bakhia: {
          hook: 'Cháy máy ảnh chưa mấy ní? Góc này không đẹp tui đền lại tiền xăng luôn nè!',
          story: 'Người ta đi studio máy lạnh, còn tui kéo xuống giàn hoa Sa Đéc bơi xuồng ngắm hoa nở tưng bừng. Lên hình một cái là triệu view TikTok ngay chứ đùa đâu!',
          cta: 'Nhanh tay tag đứa bạn thân vô rủ đi Sa Đéc cuối tuần này liền đi nè!'
        }
      }
    },
    {
      topicId: 'sen-thapmuoi',
      title: 'Trà Sen Tháp Mười - Hương Thơm Đất Mẹ Phù Sa',
      product: 'Trà Hoa Sen Sấy Thăng Hoa OCOP 5★',
      region: 'Đô thị Tháp Mười',
      tones: {
        mientay: {
          hook: 'Tháp Mười đẹp nhất bông sen, nhấp ngụm trà sen ấm lòng con cháu phương xa.',
          story: 'Sáng sớm bơi xuồng ra giữa bạt ngàn đồng sen hái từng bông vừa hé nụ để ướp trà. Trà thơm thoang thoảng mùi đồng nội, uống vô thanh mát nhẹ nhõm cả tâm can.',
          cta: 'Thử ngay hộp trà sen Tháp Mười thượng hạng, giao tận nhà 24/7 qua VietQR.'
        },
        nghenhan: {
          hook: 'Thanh lọc tâm hồn cùng đóa sen bách diệp giữa miền linh địa Tháp Mười.',
          story: 'Công nghệ sấy thăng hoa lưu giữ nguyên vẹn sắc hoa và dược tính quý báu. Từng tách trà sen là bản giao hưởng giữa thiên nhiên và tâm huyết người gìn giữ đất mẹ.',
          cta: 'Đặt mua sản phẩm OCOP 5 sao quốc gia Ecolotus để thưởng lãm nghệ thuật trà đạo.'
        },
        bakhia: {
          hook: 'Bớt uống trà sữa lại, uống trà sen Tháp Mười này da đẹp dáng chuẩn liền nè!',
          story: 'Một bông sen nở bung trong ly nước sôi thơm nức cả phòng làm việc. Vừa healthy, vừa sang chảnh lại đậm chất quý tộc miền sông nước. Mấy bà văn phòng mê tít thò lò!',
          cta: 'Bấm ngay nút mua bên dưới, cọc VietQR 24h nhận hàng liền tay!'
        }
      }
    }
  ];

  window.HuongSenAiData = {
    TONE_STYLES,
    DIALECT_SAMPLE_SCRIPTS,
    generateScript: function(topicId, toneKey) {
      const item = DIALECT_SAMPLE_SCRIPTS.find(s => s.topicId === topicId) || DIALECT_SAMPLE_SCRIPTS[0];
      const tone = item.tones[toneKey] || item.tones.mientay;
      return {
        item,
        toneKey,
        script: tone
      };
    }
  };
})();
