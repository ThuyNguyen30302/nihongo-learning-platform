/**
 * add-n4-vietnamese.ts
 *
 * Curated N4 vocabulary with Vietnamese meanings → update words table.
 *
 * Usage:  npx ts-node scripts/add-n4-vietnamese.ts
 */

import Database from 'better-sqlite3';
import * as path from 'path';

const N4_WORDS: { kana: string; kanji?: string; meaning_vi: string }[] = [
  // ── Verbs ──
  { kana: 'あがる', kanji: '上がる', meaning_vi: 'Tăng lên, Đi lên' },
  { kana: 'さがる', kanji: '下がる', meaning_vi: 'Giảm xuống, Đi xuống' },
  { kana: 'あつまる', kanji: '集まる', meaning_vi: 'Tập trung, Tụ họp (tự động)' },
  { kana: 'あつめる', kanji: '集める', meaning_vi: 'Thu thập, Tập hợp (chủ động)' },
  { kana: 'おくる', kanji: '送る', meaning_vi: 'Gửi, Tiễn' },
  { kana: 'なおす', kanji: '直す', meaning_vi: 'Sửa, Chữa' },
  { kana: 'かたづける', kanji: '片付ける', meaning_vi: 'Dọn dẹp, Sắp xếp' },
  { kana: 'さがす', kanji: '探す', meaning_vi: 'Tìm kiếm' },
  { kana: 'みつかる', kanji: '見つかる', meaning_vi: 'Được tìm thấy (tự động)' },
  { kana: 'みつける', kanji: '見つける', meaning_vi: 'Tìm thấy (chủ động)' },
  { kana: 'おちる', kanji: '落ちる', meaning_vi: 'Rơi, Rớt, Trượt' },
  { kana: 'おとす', kanji: '落とす', meaning_vi: 'Làm rơi, Đánh rơi' },
  { kana: 'おこる', kanji: '怒る', meaning_vi: 'Nổi giận, Tức giận' },
  { kana: 'わらう', kanji: '笑う', meaning_vi: 'Cười' },
  { kana: 'なく', kanji: '泣く', meaning_vi: 'Khóc' },
  { kana: 'おどる', kanji: '踊る', meaning_vi: 'Nhảy, Múa' },
  { kana: 'つづける', kanji: '続ける', meaning_vi: 'Tiếp tục (chủ động)' },
  { kana: 'つづく', kanji: '続く', meaning_vi: 'Tiếp tục (tự động)' },
  { kana: 'おわる', kanji: '終わる', meaning_vi: 'Kết thúc (tự động)' },
  { kana: 'はじまる', kanji: '始まる', meaning_vi: 'Bắt đầu (tự động)' },
  { kana: 'はじめる', kanji: '始める', meaning_vi: 'Bắt đầu (chủ động)' },
  { kana: 'かわる', kanji: '変わる', meaning_vi: 'Thay đổi (tự động)' },
  { kana: 'かえる', kanji: '変える', meaning_vi: 'Thay đổi (chủ động)' },
  { kana: 'うごく', kanji: '動く', meaning_vi: 'Di chuyển, Chuyển động' },
  { kana: 'やめる', kanji: '辞める', meaning_vi: 'Nghỉ (việc), Bỏ' },
  { kana: 'きめる', kanji: '決める', meaning_vi: 'Quyết định' },
  { kana: 'きまる', kanji: '決まる', meaning_vi: 'Được quyết định' },
  { kana: 'しらべる', kanji: '調べる', meaning_vi: 'Điều tra, Tra cứu' },
  { kana: 'はこぶ', kanji: '運ぶ', meaning_vi: 'Vận chuyển, Mang vác' },
  { kana: 'わたす', kanji: '渡す', meaning_vi: 'Đưa, Trao, Giao' },
  { kana: 'わたる', kanji: '渡る', meaning_vi: 'Băng qua, Vượt qua' },
  { kana: 'かよう', kanji: '通う', meaning_vi: 'Đi lại thường xuyên (học, làm)' },
  { kana: 'とおる', kanji: '通る', meaning_vi: 'Đi qua, Thông qua' },
  { kana: 'なおる', kanji: '治る', meaning_vi: 'Khỏi (bệnh), Lành (tự động)' },
  { kana: 'すてる', kanji: '捨てる', meaning_vi: 'Vứt bỏ, Bỏ đi' },
  { kana: 'くれる', meaning_vi: 'Trời tối, (ai đó) cho' },
  { kana: 'ひく', kanji: '引く', meaning_vi: 'Kéo, Lùi' },
  { kana: 'ひく', kanji: '弾く', meaning_vi: 'Chơi (nhạc cụ dây)' },
  { kana: 'おす', kanji: '押す', meaning_vi: 'Đẩy, Nhấn, Ấn' },
  { kana: 'まわる', kanji: '回る', meaning_vi: 'Quay, Xoay (tự động)' },
  { kana: 'まわす', kanji: '回す', meaning_vi: 'Quay, Xoay (chủ động)' },
  { kana: 'たおれる', kanji: '倒れる', meaning_vi: 'Ngã, Đổ (tự động)' },
  { kana: 'きえる', kanji: '消える', meaning_vi: 'Biến mất, Tắt (tự động)' },
  { kana: 'しぬ', kanji: '死ぬ', meaning_vi: 'Chết' },
  { kana: 'たのむ', kanji: '頼む', meaning_vi: 'Nhờ, Yêu cầu' },
  { kana: 'ちがう', kanji: '違う', meaning_vi: 'Khác, Sai' },
  { kana: 'きこえる', kanji: '聞こえる', meaning_vi: 'Nghe thấy (tự nhiên)' },
  { kana: 'みえる', kanji: '見える', meaning_vi: 'Nhìn thấy (tự nhiên)' },
  { kana: 'きがつく', kanji: '気が付く', meaning_vi: 'Nhận ra, Để ý' },
  { kana: 'あんないする', kanji: '案内する', meaning_vi: 'Hướng dẫn, Chỉ dẫn' },
  { kana: 'せつめいする', kanji: '説明する', meaning_vi: 'Giải thích' },
  { kana: 'しゅっぱつする', kanji: '出発する', meaning_vi: 'Khởi hành, Xuất phát' },
  { kana: 'うんてんする', kanji: '運転する', meaning_vi: 'Lái xe' },
  { kana: 'さんぽする', kanji: '散歩する', meaning_vi: 'Đi dạo' },
  { kana: 'よやくする', kanji: '予約する', meaning_vi: 'Đặt trước, Đặt chỗ' },
  { kana: 'しんぱいする', kanji: '心配する', meaning_vi: 'Lo lắng' },
  { kana: 'れんしゅうする', kanji: '練習する', meaning_vi: 'Luyện tập' },
  { kana: 'そうじする', kanji: '掃除する', meaning_vi: 'Dọn dẹp, Quét dọn' },
  { kana: 'せんたくする', kanji: '洗濯する', meaning_vi: 'Giặt giũ' },
  { kana: 'りょうりする', kanji: '料理する', meaning_vi: 'Nấu ăn' },
  { kana: 'けっこんする', kanji: '結婚する', meaning_vi: 'Kết hôn' },
  { kana: 'しつもんする', kanji: '質問する', meaning_vi: 'Đặt câu hỏi, Hỏi' },
  { kana: 'ちゅういする', kanji: '注意する', meaning_vi: 'Chú ý, Cảnh báo' },
  { kana: 'ほんやくする', kanji: '翻訳する', meaning_vi: 'Dịch (ngôn ngữ)' },
  { kana: 'しっぱいする', kanji: '失敗する', meaning_vi: 'Thất bại' },
  { kana: 'せいこうする', kanji: '成功する', meaning_vi: 'Thành công' },
  { kana: 'はっこうする', kanji: '発行する', meaning_vi: 'Phát hành' },
  { kana: 'さわぐ', kanji: '騒ぐ', meaning_vi: 'Làm ồn, Ồn ào' },
  { kana: 'いのる', kanji: '祈る', meaning_vi: 'Cầu nguyện' },
  { kana: 'くれる', kanji: '暮れる', meaning_vi: 'Kết thúc (ngày, năm)' },
  { kana: 'たてる', kanji: '建てる', meaning_vi: 'Xây dựng' },
  { kana: 'たつ', kanji: '建つ', meaning_vi: 'Được xây dựng' },
  { kana: 'うえる', kanji: '植える', meaning_vi: 'Trồng (cây)' },
  { kana: 'そだてる', kanji: '育てる', meaning_vi: 'Nuôi dưỡng, Trồng trọt' },
  { kana: 'そだつ', kanji: '育つ', meaning_vi: 'Lớn lên, Phát triển' },
  { kana: 'にげる', kanji: '逃げる', meaning_vi: 'Chạy trốn, Bỏ chạy' },
  { kana: 'かぞえる', kanji: '数える', meaning_vi: 'Đếm' },
  { kana: 'くらべる', kanji: '比べる', meaning_vi: 'So sánh' },
  { kana: 'まちがえる', kanji: '間違える', meaning_vi: 'Nhầm, Sai' },
  { kana: 'よごれる', kanji: '汚れる', meaning_vi: 'Bẩn (tự động)' },
  { kana: 'あらう', kanji: '洗う', meaning_vi: 'Rửa' },
  { kana: 'たたく', meaning_vi: 'Đánh, Gõ, Vỗ' },
  { kana: 'さわる', kanji: '触る', meaning_vi: 'Chạm, Sờ' },
  { kana: 'まにあう', kanji: '間に合う', meaning_vi: 'Kịp giờ' },

  // ── い Adjectives ──
  { kana: 'うれしい', kanji: '嬉しい', meaning_vi: 'Vui mừng' },
  { kana: 'さびしい', kanji: '寂しい', meaning_vi: 'Cô đơn, Buồn' },
  { kana: 'うるさい', meaning_vi: 'Ồn ào, Phiền phức' },
  { kana: 'ねむい', kanji: '眠い', meaning_vi: 'Buồn ngủ' },
  { kana: 'ほしい', kanji: '欲しい', meaning_vi: 'Muốn, Mong muốn' },
  { kana: 'いたい', kanji: '痛い', meaning_vi: 'Đau, Nhức' },
  { kana: 'すごい', meaning_vi: 'Tuyệt vời, Kinh khủng' },
  { kana: 'こわい', kanji: '怖い', meaning_vi: 'Đáng sợ, Sợ hãi' },
  { kana: 'すくない', kanji: '少ない', meaning_vi: 'Ít' },
  { kana: 'ただしい', kanji: '正しい', meaning_vi: 'Đúng, Chính xác' },
  { kana: 'ふかい', kanji: '深い', meaning_vi: 'Sâu' },
  { kana: 'ふとい', kanji: '太い', meaning_vi: 'To, Mập, Dày' },
  { kana: 'ほそい', kanji: '細い', meaning_vi: 'Mảnh, Thon, Gầy' },
  { kana: 'あぶない', kanji: '危ない', meaning_vi: 'Nguy hiểm' },
  { kana: 'きびしい', kanji: '厳しい', meaning_vi: 'Nghiêm khắc, Khắt khe' },
  { kana: 'あまい', kanji: '甘い', meaning_vi: 'Ngọt, Ngọt ngào' },
  { kana: 'にがい', kanji: '苦い', meaning_vi: 'Đắng' },
  { kana: 'すっぱい', kanji: '酸っぱい', meaning_vi: 'Chua' },
  { kana: 'しょっぱい', meaning_vi: 'Mặn' },
  { kana: 'かたい', kanji: '硬い', meaning_vi: 'Cứng, Rắn' },
  { kana: 'やわらかい', kanji: '柔らかい', meaning_vi: 'Mềm' },
  { kana: 'めずらしい', kanji: '珍しい', meaning_vi: 'Hiếm, Quý hiếm' },
  { kana: 'かしこい', kanji: '賢い', meaning_vi: 'Thông minh, Khôn ngoan' },
  { kana: 'はずかしい', kanji: '恥ずかしい', meaning_vi: 'Xấu hổ, Ngại ngùng' },
  { kana: 'すばらしい', kanji: '素晴らしい', meaning_vi: 'Tuyệt vời, Xuất sắc' },
  { kana: 'ふしぎ', kanji: '不思議', meaning_vi: 'Kỳ lạ, Bí ẩn' },

  // ── な Adjectives ──
  { kana: 'たいへん', kanji: '大変', meaning_vi: 'Vất vả, Rất (nhấn mạnh)' },
  { kana: 'とくい', kanji: '得意', meaning_vi: 'Sở trường, Giỏi về' },
  { kana: 'にがて', kanji: '苦手', meaning_vi: 'Sở đoản, Không giỏi' },
  { kana: 'らく', kanji: '楽', meaning_vi: 'Thoải mái, Dễ dàng' },
  { kana: 'ざんねん', kanji: '残念', meaning_vi: 'Đáng tiếc, Tiếc nuối' },
  { kana: 'しんせつ', kanji: '親切', meaning_vi: 'Tử tế, Thân thiện' },
  { kana: 'あんぜん', kanji: '安全', meaning_vi: 'An toàn' },
  { kana: 'ふくざつ', kanji: '複雑', meaning_vi: 'Phức tạp' },
  { kana: 'ひつよう', kanji: '必要', meaning_vi: 'Cần thiết' },
  { kana: 'むり', kanji: '無理', meaning_vi: 'Vô lý, Không thể, Quá sức' },
  { kana: 'ねっしん', kanji: '熱心', meaning_vi: 'Nhiệt tình, Say mê' },
  { kana: 'じゆう', kanji: '自由', meaning_vi: 'Tự do' },
  { kana: 'まじめ', kanji: '真面目', meaning_vi: 'Nghiêm túc, Chăm chỉ' },
  { kana: 'とつぜん', kanji: '突然', meaning_vi: 'Đột nhiên, Bất ngờ' },
  { kana: 'へいき', kanji: '平気', meaning_vi: 'Bình thường, Không sao' },
  { kana: 'らんぼう', kanji: '乱暴', meaning_vi: 'Thô bạo, Bạo lực' },
  { kana: 'ていねい', kanji: '丁寧', meaning_vi: 'Lịch sự, Cẩn thận' },

  // ── Nouns: Work & Business ──
  { kana: 'しごと', kanji: '仕事', meaning_vi: 'Công việc' },
  { kana: 'かいぎ', kanji: '会議', meaning_vi: 'Hội nghị, Cuộc họp' },
  { kana: 'しょくば', kanji: '職場', meaning_vi: 'Nơi làm việc' },
  { kana: 'きゅうりょう', kanji: '給料', meaning_vi: 'Lương' },
  { kana: 'じむしょ', kanji: '事務所', meaning_vi: 'Văn phòng' },
  { kana: 'こうじょう', kanji: '工場', meaning_vi: 'Nhà máy, Xưởng' },
  { kana: 'しゃちょう', kanji: '社長', meaning_vi: 'Giám đốc' },
  { kana: 'ぶちょう', kanji: '部長', meaning_vi: 'Trưởng phòng' },
  { kana: 'かちょう', kanji: '課長', meaning_vi: 'Trưởng nhóm' },
  { kana: 'てんいん', kanji: '店員', meaning_vi: 'Nhân viên bán hàng' },
  { kana: 'いしゃ', kanji: '医者', meaning_vi: 'Bác sĩ' },
  { kana: 'かんごし', kanji: '看護師', meaning_vi: 'Y tá' },
  { kana: 'べんごし', kanji: '弁護士', meaning_vi: 'Luật sư' },
  { kana: 'じゅうしょ', kanji: '住所', meaning_vi: 'Địa chỉ' },
  { kana: 'よてい', kanji: '予定', meaning_vi: 'Kế hoạch, Dự định' },
  { kana: 'けいけん', kanji: '経験', meaning_vi: 'Kinh nghiệm' },
  { kana: 'いけん', kanji: '意見', meaning_vi: 'Ý kiến' },
  { kana: 'せいせき', kanji: '成績', meaning_vi: 'Thành tích, Kết quả' },

  // ── Nouns: School & Education ──
  { kana: 'しけん', kanji: '試験', meaning_vi: 'Kỳ thi, Bài kiểm tra' },
  { kana: 'しゅくだい', kanji: '宿題', meaning_vi: 'Bài tập về nhà' },
  { kana: 'ふくしゅう', kanji: '復習', meaning_vi: 'Ôn tập' },
  { kana: 'よしゅう', kanji: '予習', meaning_vi: 'Chuẩn bị bài trước' },
  { kana: 'じゅぎょう', kanji: '授業', meaning_vi: 'Buổi học, Tiết học' },
  { kana: 'きょうかしょ', kanji: '教科書', meaning_vi: 'Sách giáo khoa' },
  { kana: 'いみ', kanji: '意味', meaning_vi: 'Ý nghĩa' },
  { kana: 'ぶんぽう', kanji: '文法', meaning_vi: 'Ngữ pháp' },
  { kana: 'はつおん', kanji: '発音', meaning_vi: 'Phát âm' },
  { kana: 'かいわ', kanji: '会話', meaning_vi: 'Hội thoại, Đối thoại' },
  { kana: 'たんご', kanji: '単語', meaning_vi: 'Từ vựng' },
  { kana: 'ぶんしょう', kanji: '文章', meaning_vi: 'Câu văn, Đoạn văn' },

  // ── Nouns: Health & Body ──
  { kana: 'びょうき', kanji: '病気', meaning_vi: 'Bệnh, Ốm' },
  { kana: 'かぜ', kanji: '風邪', meaning_vi: 'Cảm, Cảm lạnh' },
  { kana: 'くすり', kanji: '薬', meaning_vi: 'Thuốc' },
  { kana: 'ねつ', kanji: '熱', meaning_vi: 'Sốt, Nhiệt' },
  { kana: 'ちから', kanji: '力', meaning_vi: 'Sức mạnh, Lực' },
  { kana: 'けが', kanji: '怪我', meaning_vi: 'Chấn thương, Vết thương' },
  { kana: 'きゅうけい', kanji: '休憩', meaning_vi: 'Nghỉ giải lao' },
  { kana: 'ほけん', kanji: '保険', meaning_vi: 'Bảo hiểm' },

  // ── Nouns: Travel & Transport ──
  { kana: 'りょこう', kanji: '旅行', meaning_vi: 'Du lịch' },
  { kana: 'くうこう', kanji: '空港', meaning_vi: 'Sân bay' },
  { kana: 'しゅうてん', kanji: '終点', meaning_vi: 'Điểm cuối, Ga cuối' },
  { kana: 'ていきけん', kanji: '定期券', meaning_vi: 'Vé tháng' },
  { kana: 'のりかえる', kanji: '乗り換える', meaning_vi: 'Chuyển (tàu, xe), Đổi tuyến' },
  { kana: 'パスポート', meaning_vi: 'Hộ chiếu' },
  { kana: 'にもつ', kanji: '荷物', meaning_vi: 'Hành lý' },

  // ── Nouns: Daily Life ──
  { kana: 'せいかつ', kanji: '生活', meaning_vi: 'Cuộc sống, Sinh hoạt' },
  { kana: 'しゅうかん', kanji: '習慣', meaning_vi: 'Thói quen, Tập quán' },
  { kana: 'けいざい', kanji: '経済', meaning_vi: 'Kinh tế' },
  { kana: 'せいじ', kanji: '政治', meaning_vi: 'Chính trị' },
  { kana: 'しゃかい', kanji: '社会', meaning_vi: 'Xã hội' },
  { kana: 'ぶんか', kanji: '文化', meaning_vi: 'Văn hóa' },
  { kana: 'かんきょう', kanji: '環境', meaning_vi: 'Môi trường' },
  { kana: 'じんこう', kanji: '人口', meaning_vi: 'Dân số' },
  { kana: 'きかい', kanji: '機会', meaning_vi: 'Cơ hội' },
  { kana: 'ほうほう', kanji: '方法', meaning_vi: 'Phương pháp, Cách thức' },
  { kana: 'やくそく', kanji: '約束', meaning_vi: 'Lời hứa, Cuộc hẹn' },
  { kana: 'きもち', kanji: '気持ち', meaning_vi: 'Cảm giác, Tâm trạng' },
  { kana: 'せいかく', kanji: '性格', meaning_vi: 'Tính cách' },
  { kana: 'めんどう', kanji: '面倒', meaning_vi: 'Phiền phức, Rắc rối' },
  { kana: 'きねん', kanji: '記念', meaning_vi: 'Kỷ niệm' },
  { kana: 'しんごう', kanji: '信号', meaning_vi: 'Đèn giao thông, Tín hiệu' },
  { kana: 'じゅんび', kanji: '準備', meaning_vi: 'Chuẩn bị' },
  { kana: 'せわ', kanji: '世話', meaning_vi: 'Chăm sóc, Giúp đỡ' },
  { kana: 'じこ', kanji: '事故', meaning_vi: 'Tai nạn' },
  { kana: 'ゆめ', kanji: '夢', meaning_vi: 'Giấc mơ, Ước mơ' },
  { kana: 'あいだ', kanji: '間', meaning_vi: 'Khoảng giữa, Trong khi' },
  { kana: 'ばしょ', kanji: '場所', meaning_vi: 'Địa điểm, Nơi chốn' },
  { kana: 'ほうりつ', kanji: '法律', meaning_vi: 'Luật pháp' },
  { kana: 'よほう', kanji: '予報', meaning_vi: 'Dự báo' },
  { kana: 'かんけい', kanji: '関係', meaning_vi: 'Mối quan hệ, Liên quan' },

  // ── Nouns: Food (more) ──
  { kana: 'りょうり', kanji: '料理', meaning_vi: 'Món ăn, Nấu ăn' },
  { kana: 'しょくじ', kanji: '食事', meaning_vi: 'Bữa ăn' },
  { kana: 'あじ', kanji: '味', meaning_vi: 'Vị, Hương vị' },
  { kana: 'こむぎ', kanji: '小麦', meaning_vi: 'Lúa mì' },
  { kana: 'しょうゆ', kanji: '醤油', meaning_vi: 'Nước tương, Xì dầu' },
  { kana: 'みそ', kanji: '味噌', meaning_vi: 'Miso, Tương Nhật' },

  // ── Nouns: Shopping ──
  { kana: 'かいもの', kanji: '買い物', meaning_vi: 'Mua sắm' },
  { kana: 'ねだん', kanji: '値段', meaning_vi: 'Giá cả' },
  { kana: 'おつり', meaning_vi: 'Tiền thối' },
  { kana: 'レシート', meaning_vi: 'Hóa đơn, Biên lai' },
  { kana: 'さいふ', kanji: '財布', meaning_vi: 'Ví tiền' },
  { kana: 'うりば', kanji: '売り場', meaning_vi: 'Quầy bán, Khu bán hàng' },

  // ── Nouns: Technology ──
  { kana: 'インターネット', meaning_vi: 'Internet' },
  { kana: 'メール', meaning_vi: 'Email, Thư điện tử' },
  { kana: 'けいたいでんわ', kanji: '携帯電話', meaning_vi: 'Điện thoại di động' },
  { kana: 'スマートフォン', meaning_vi: 'Điện thoại thông minh' },
  { kana: 'でんき', kanji: '電気', meaning_vi: 'Điện' },

  // ── Adverbs & Conjunctions ──
  { kana: 'きっと', meaning_vi: 'Chắc chắn, Nhất định' },
  { kana: 'たぶん', kanji: '多分', meaning_vi: 'Có lẽ' },
  { kana: 'かならず', kanji: '必ず', meaning_vi: 'Nhất định, Chắc chắn' },
  { kana: 'ぜひ', kanji: '是非', meaning_vi: 'Nhất định (mong muốn)' },
  { kana: 'けっして', kanji: '決して', meaning_vi: 'Không bao giờ (phủ định)' },
  { kana: 'ほとんど', meaning_vi: 'Hầu hết, Gần như' },
  { kana: 'もっと', meaning_vi: 'Hơn nữa, Nhiều hơn' },
  { kana: 'ずっと', meaning_vi: 'Suốt, Mãi, Hơn hẳn' },
  { kana: 'やっと', meaning_vi: 'Cuối cùng thì' },
  { kana: 'いっぱい', meaning_vi: 'Đầy, Nhiều' },
  { kana: 'ちっとも', meaning_vi: 'Không...chút nào (phủ định)' },
  { kana: 'なかなか', meaning_vi: 'Khá là, Mãi mà không' },
  { kana: 'だんだん', meaning_vi: 'Dần dần' },
  { kana: 'そろそろ', meaning_vi: 'Sắp sửa, Đến lúc' },
  { kana: 'なるほど', meaning_vi: 'Ra vậy, Thì ra là thế' },
  { kana: 'たしか', kanji: '確か', meaning_vi: 'Hình như, Nếu nhớ không nhầm' },
  { kana: 'ふつう', kanji: '普通', meaning_vi: 'Bình thường, Thông thường' },
  { kana: 'さっき', meaning_vi: 'Vừa nãy, Lúc nãy' },
  { kana: 'このごろ', meaning_vi: 'Gần đây, Dạo này' },
  { kana: 'それで', meaning_vi: 'Vì thế, Cho nên' },
  { kana: 'そこで', meaning_vi: 'Do đó, Vì vậy' },
  { kana: 'それに', meaning_vi: 'Thêm vào đó, Hơn nữa' },
  { kana: 'ところで', meaning_vi: 'Nhân tiện, À mà' },
  { kana: 'しかし', meaning_vi: 'Tuy nhiên, Nhưng' },
  { kana: 'けれども', meaning_vi: 'Mặc dù, Tuy nhiên' },
  { kana: 'または', meaning_vi: 'Hoặc là' },

  // ── More Verbs ──
  { kana: 'きがえる', kanji: '着替える', meaning_vi: 'Thay quần áo' },
  { kana: 'ぬぐ', kanji: '脱ぐ', meaning_vi: 'Cởi (quần áo)' },
  { kana: 'はく', kanji: '履く', meaning_vi: 'Mang (giày, quần, tất)' },
  { kana: 'かぶる', meaning_vi: 'Đội (mũ)' },
  { kana: 'つける', kanji: '付ける', meaning_vi: 'Gắn, Đính kèm' },
  { kana: 'きる', kanji: '切る', meaning_vi: 'Cắt' },
  { kana: 'おれる', kanji: '折れる', meaning_vi: 'Gãy, Gập (tự động)' },
  { kana: 'こわれる', kanji: '壊れる', meaning_vi: 'Hỏng, Vỡ (tự động)' },
  { kana: 'こわす', kanji: '壊す', meaning_vi: 'Phá hỏng, Làm vỡ' },
  { kana: 'まがる', kanji: '曲がる', meaning_vi: 'Rẽ, Cong, Quẹo' },
  { kana: 'なれる', kanji: '慣れる', meaning_vi: 'Quen với' },
  { kana: 'ひっこす', kanji: '引っ越す', meaning_vi: 'Chuyển nhà' },
  { kana: 'しめる', kanji: '締める', meaning_vi: 'Thắt, Cột, Siết chặt' },
  { kana: 'ゆれる', kanji: '揺れる', meaning_vi: 'Rung, Lắc (tự động)' },
  { kana: 'まける', kanji: '負ける', meaning_vi: 'Thua, Bại' },
  { kana: 'かつ', kanji: '勝つ', meaning_vi: 'Thắng' },
  { kana: 'すむ', kanji: '住む', meaning_vi: 'Sống, Cư trú' },
  { kana: 'はれる', kanji: '晴れる', meaning_vi: 'Trời quang, Nắng' },
  { kana: 'くもる', kanji: '曇る', meaning_vi: 'Có mây, Âm u' },

  // ── Time & Numbers ──
  { kana: 'いちど', kanji: '一度', meaning_vi: 'Một lần' },
  { kana: 'にど', kanji: '二度', meaning_vi: 'Hai lần' },
  { kana: 'はんぶん', kanji: '半分', meaning_vi: 'Một nửa' },
  { kana: 'だいたい', kanji: '大体', meaning_vi: 'Đại khái, Khoảng' },
  { kana: 'ごぜん', kanji: '午前', meaning_vi: 'Buổi sáng (AM)' },
  { kana: 'ごご', kanji: '午後', meaning_vi: 'Buổi chiều (PM)' },
  { kana: 'しょうらい', kanji: '将来', meaning_vi: 'Tương lai' },
  { kana: 'むかし', kanji: '昔', meaning_vi: 'Ngày xưa, Xưa kia' },
  { kana: 'さいきん', kanji: '最近', meaning_vi: 'Gần đây, Mới đây' },

  // ── Feelings & Communication ──
  { kana: 'おれい', kanji: 'お礼', meaning_vi: 'Lời cảm ơn, Quà cảm ơn' },
  { kana: 'おわび', kanji: 'お詫び', meaning_vi: 'Lời xin lỗi' },
  { kana: 'じょうだん', kanji: '冗談', meaning_vi: 'Nói đùa, Đùa giỡn' },
  { kana: 'うそ', kanji: '嘘', meaning_vi: 'Nói dối, Dối trá' },
  { kana: 'なみだ', kanji: '涙', meaning_vi: 'Nước mắt' },
  { kana: 'えがお', kanji: '笑顔', meaning_vi: 'Nụ cười, Mặt cười' },
  { kana: 'しあわせ', kanji: '幸せ', meaning_vi: 'Hạnh phúc' },
  { kana: 'なやみ', kanji: '悩み', meaning_vi: 'Nỗi lo, Điều phiền muộn' },
];

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  console.log(`Adding Vietnamese meanings for ${N4_WORDS.length} N4 words...`);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const matchExact = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND kanji = ? AND meaning_vi = ''");
  const matchKana = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND meaning_vi = ''");
  const matchLike = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana LIKE ? AND meaning_vi = ''");

  let exactMatches = 0;
  let kanaMatches = 0;
  let likeMatches = 0;
  let noMatch = 0;

  const updateBatch = db.transaction(() => {
    for (const word of N4_WORDS) {
      if (word.kanji) {
        const r = matchExact.run(word.meaning_vi, word.kana, word.kanji);
        if (r.changes > 0) { exactMatches++; continue; }
      }

      const r2 = matchKana.run(word.meaning_vi, word.kana);
      if (r2.changes > 0) { kanaMatches++; continue; }

      const r3 = matchLike.run(word.meaning_vi, word.kana + '%');
      if (r3.changes > 0) { likeMatches++; continue; }

      noMatch++;
    }
  });

  updateBatch();

  console.log(`\nMatching results:`);
  console.log(`  Exact (kanji + kana): ${exactMatches}`);
  console.log(`  Kana-only:            ${kanaMatches}`);
  console.log(`  Kana-like:            ${likeMatches}`);
  console.log(`  No match:             ${noMatch}`);

  const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN meaning_vi != '' THEN 1 ELSE 0 END) as with_vi FROM words").get() as { total: number; with_vi: number };
  console.log(`\nTotal words with Vietnamese: ${stats.with_vi} / ${stats.total}`);

  const samples = db.prepare("SELECT kanji, kana, meaning_vi FROM words WHERE meaning_vi != '' ORDER BY id DESC LIMIT 6").all() as { kanji: string; kana: string; meaning_vi: string }[];
  console.log('\nSample recent entries:');
  for (const s of samples) {
    console.log(`  ${s.kanji.padEnd(10)} ${s.kana.padEnd(14)} → ${s.meaning_vi}`);
  }

  db.close();
  console.log('\nDone!');
}

main();
