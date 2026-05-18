/**
 * add-n5-vietnamese.ts
 *
 * Curated N5 vocabulary with Vietnamese meanings → update words table.
 * Maps words to DB via kana + kanji matching.
 *
 * Usage:  npx ts-node scripts/add-n5-vietnamese.ts
 */

import Database from 'better-sqlite3';
import * as path from 'path';

// Core N5 vocabulary: { kana: string, kanji?: string, meaning_vi: string }
// Organized by category. If kanji omitted, matches by kana only.

const N5_WORDS: { kana: string; kanji?: string; meaning_vi: string }[] = [
  // ── Numbers ──
  { kana: 'いち', kanji: '一', meaning_vi: 'Một' },
  { kana: 'に', kanji: '二', meaning_vi: 'Hai' },
  { kana: 'さん', kanji: '三', meaning_vi: 'Ba' },
  { kana: 'よん', kanji: '四', meaning_vi: 'Bốn' },
  { kana: 'ご', kanji: '五', meaning_vi: 'Năm' },
  { kana: 'ろく', kanji: '六', meaning_vi: 'Sáu' },
  { kana: 'なな', kanji: '七', meaning_vi: 'Bảy' },
  { kana: 'はち', kanji: '八', meaning_vi: 'Tám' },
  { kana: 'きゅう', kanji: '九', meaning_vi: 'Chín' },
  { kana: 'じゅう', kanji: '十', meaning_vi: 'Mười' },
  { kana: 'ひゃく', kanji: '百', meaning_vi: 'Trăm' },
  { kana: 'せん', kanji: '千', meaning_vi: 'Nghìn' },
  { kana: 'まん', kanji: '万', meaning_vi: 'Mười nghìn' },

  // ── Time ──
  { kana: 'じ', kanji: '時', meaning_vi: 'Giờ' },
  { kana: 'ふん', kanji: '分', meaning_vi: 'Phút' },
  { kana: 'にち', kanji: '日', meaning_vi: 'Ngày, Mặt trời' },
  { kana: 'げつ', kanji: '月', meaning_vi: 'Tháng, Mặt trăng' },
  { kana: 'ねん', kanji: '年', meaning_vi: 'Năm' },
  { kana: 'きょう', kanji: '今日', meaning_vi: 'Hôm nay' },
  { kana: 'あした', kanji: '明日', meaning_vi: 'Ngày mai' },
  { kana: 'あす', kanji: '明日', meaning_vi: 'Ngày mai' },
  { kana: 'きのう', kanji: '昨日', meaning_vi: 'Hôm qua' },
  { kana: 'あさ', kanji: '朝', meaning_vi: 'Buổi sáng' },
  { kana: 'ひる', kanji: '昼', meaning_vi: 'Buổi trưa' },
  { kana: 'ゆうがた', kanji: '夕方', meaning_vi: 'Chiều tối' },
  { kana: 'よる', kanji: '夜', meaning_vi: 'Buổi tối, Đêm' },
  { kana: 'ばん', kanji: '晩', meaning_vi: 'Tối' },
  { kana: 'せんしゅう', kanji: '先週', meaning_vi: 'Tuần trước' },
  { kana: 'こんしゅう', kanji: '今週', meaning_vi: 'Tuần này' },
  { kana: 'らいしゅう', kanji: '来週', meaning_vi: 'Tuần sau' },
  { kana: 'せんげつ', kanji: '先月', meaning_vi: 'Tháng trước' },
  { kana: 'こんげつ', kanji: '今月', meaning_vi: 'Tháng này' },
  { kana: 'らいげつ', kanji: '来月', meaning_vi: 'Tháng sau' },
  { kana: 'きょねん', kanji: '去年', meaning_vi: 'Năm ngoái' },
  { kana: 'ことし', kanji: '今年', meaning_vi: 'Năm nay' },
  { kana: 'らいねん', kanji: '来年', meaning_vi: 'Năm sau' },
  { kana: 'まいにち', kanji: '毎日', meaning_vi: 'Mỗi ngày' },
  { kana: 'まいあさ', kanji: '毎朝', meaning_vi: 'Mỗi sáng' },
  { kana: 'まいばん', kanji: '毎晩', meaning_vi: 'Mỗi tối' },
  { kana: 'まいしゅう', kanji: '毎週', meaning_vi: 'Mỗi tuần' },
  { kana: 'まいつき', kanji: '毎月', meaning_vi: 'Mỗi tháng' },
  { kana: 'まいとし', kanji: '毎年', meaning_vi: 'Mỗi năm' },

  // ── Days of week ──
  { kana: 'にちようび', kanji: '日曜日', meaning_vi: 'Chủ Nhật' },
  { kana: 'げつようび', kanji: '月曜日', meaning_vi: 'Thứ Hai' },
  { kana: 'かようび', kanji: '火曜日', meaning_vi: 'Thứ Ba' },
  { kana: 'すいようび', kanji: '水曜日', meaning_vi: 'Thứ Tư' },
  { kana: 'もくようび', kanji: '木曜日', meaning_vi: 'Thứ Năm' },
  { kana: 'きんようび', kanji: '金曜日', meaning_vi: 'Thứ Sáu' },
  { kana: 'どようび', kanji: '土曜日', meaning_vi: 'Thứ Bảy' },

  // ── People & Family ──
  { kana: 'ひと', kanji: '人', meaning_vi: 'Người' },
  { kana: 'おとこ', kanji: '男', meaning_vi: 'Nam, Đàn ông' },
  { kana: 'おんな', kanji: '女', meaning_vi: 'Nữ, Phụ nữ' },
  { kana: 'こ', kanji: '子', meaning_vi: 'Con, Trẻ em' },
  { kana: 'こども', kanji: '子供', meaning_vi: 'Trẻ em' },
  { kana: 'ともだち', kanji: '友達', meaning_vi: 'Bạn bè' },
  { kana: 'かぞく', kanji: '家族', meaning_vi: 'Gia đình' },
  { kana: 'ちち', kanji: '父', meaning_vi: 'Cha (mình)' },
  { kana: 'はは', kanji: '母', meaning_vi: 'Mẹ (mình)' },
  { kana: 'おとうさん', kanji: 'お父さん', meaning_vi: 'Bố (người khác)' },
  { kana: 'おかあさん', kanji: 'お母さん', meaning_vi: 'Mẹ (người khác)' },
  { kana: 'あに', kanji: '兄', meaning_vi: 'Anh trai (mình)' },
  { kana: 'おにいさん', kanji: 'お兄さん', meaning_vi: 'Anh trai (người khác)' },
  { kana: 'あね', kanji: '姉', meaning_vi: 'Chị gái (mình)' },
  { kana: 'おねえさん', kanji: 'お姉さん', meaning_vi: 'Chị gái (người khác)' },
  { kana: 'おとうと', kanji: '弟', meaning_vi: 'Em trai' },
  { kana: 'いもうと', kanji: '妹', meaning_vi: 'Em gái' },
  { kana: 'おじいさん', meaning_vi: 'Ông' },
  { kana: 'おばあさん', meaning_vi: 'Bà' },
  { kana: 'おじさん', meaning_vi: 'Chú, Bác trai' },
  { kana: 'おばさん', meaning_vi: 'Cô, Bác gái' },
  { kana: 'せんせい', kanji: '先生', meaning_vi: 'Giáo viên, Thầy/Cô' },
  { kana: 'がくせい', kanji: '学生', meaning_vi: 'Học sinh, Sinh viên' },

  // ── Body ──
  { kana: 'め', kanji: '目', meaning_vi: 'Mắt' },
  { kana: 'みみ', kanji: '耳', meaning_vi: 'Tai' },
  { kana: 'くち', kanji: '口', meaning_vi: 'Miệng' },
  { kana: 'て', kanji: '手', meaning_vi: 'Tay' },
  { kana: 'あし', kanji: '足', meaning_vi: 'Chân' },
  { kana: 'は', kanji: '歯', meaning_vi: 'Răng' },
  { kana: 'かお', kanji: '顔', meaning_vi: 'Mặt, Khuôn mặt' },
  { kana: 'あたま', kanji: '頭', meaning_vi: 'Đầu' },
  { kana: 'からだ', kanji: '体', meaning_vi: 'Cơ thể' },

  // ── Food & Drink ──
  { kana: 'たべもの', kanji: '食べ物', meaning_vi: 'Đồ ăn, Thức ăn' },
  { kana: 'のみもの', kanji: '飲み物', meaning_vi: 'Đồ uống' },
  { kana: 'みず', kanji: '水', meaning_vi: 'Nước' },
  { kana: 'おちゃ', kanji: 'お茶', meaning_vi: 'Trà' },
  { kana: 'ぎゅうにゅう', kanji: '牛乳', meaning_vi: 'Sữa bò' },
  { kana: 'さけ', kanji: '酒', meaning_vi: 'Rượu' },
  { kana: 'にく', kanji: '肉', meaning_vi: 'Thịt' },
  { kana: 'さかな', kanji: '魚', meaning_vi: 'Cá' },
  { kana: 'やさい', kanji: '野菜', meaning_vi: 'Rau' },
  { kana: 'くだもの', kanji: '果物', meaning_vi: 'Trái cây' },
  { kana: 'たまご', kanji: '卵', meaning_vi: 'Trứng' },
  { kana: 'ごはん', kanji: 'ご飯', meaning_vi: 'Cơm, Bữa ăn' },
  { kana: 'あさごはん', kanji: '朝ご飯', meaning_vi: 'Bữa sáng' },
  { kana: 'ひるごはん', kanji: '昼ご飯', meaning_vi: 'Bữa trưa' },
  { kana: 'ばんごはん', kanji: '晩ご飯', meaning_vi: 'Bữa tối' },
  { kana: 'パン', meaning_vi: 'Bánh mì' },
  { kana: 'さとう', kanji: '砂糖', meaning_vi: 'Đường' },
  { kana: 'しお', kanji: '塩', meaning_vi: 'Muối' },
  { kana: 'コーヒー', meaning_vi: 'Cà phê' },
  { kana: 'おさけ', kanji: 'お酒', meaning_vi: 'Rượu' },

  // ── Places ──
  { kana: 'がっこう', kanji: '学校', meaning_vi: 'Trường học' },
  { kana: 'だいがく', kanji: '大学', meaning_vi: 'Đại học' },
  { kana: 'びょういん', kanji: '病院', meaning_vi: 'Bệnh viện' },
  { kana: 'かいしゃ', kanji: '会社', meaning_vi: 'Công ty' },
  { kana: 'えき', kanji: '駅', meaning_vi: 'Ga, Nhà ga' },
  { kana: 'みせ', kanji: '店', meaning_vi: 'Cửa hàng, Tiệm' },
  { kana: 'くに', kanji: '国', meaning_vi: 'Đất nước, Quốc gia' },
  { kana: 'まち', kanji: '町', meaning_vi: 'Thị trấn, Phố' },
  { kana: 'いえ', kanji: '家', meaning_vi: 'Nhà' },
  { kana: 'へや', kanji: '部屋', meaning_vi: 'Phòng, Căn phòng' },
  { kana: 'トイレ', meaning_vi: 'Nhà vệ sinh' },
  { kana: 'にもつ', kanji: '荷物', meaning_vi: 'Hành lý' },
  { kana: 'こうえん', kanji: '公園', meaning_vi: 'Công viên' },
  { kana: 'ぎんこう', kanji: '銀行', meaning_vi: 'Ngân hàng' },
  { kana: 'ゆうびんきょく', kanji: '郵便局', meaning_vi: 'Bưu điện' },
  { kana: 'としょかん', kanji: '図書館', meaning_vi: 'Thư viện' },
  { kana: 'スーパー', meaning_vi: 'Siêu thị' },
  { kana: 'ホテル', meaning_vi: 'Khách sạn' },
  { kana: 'レストラン', meaning_vi: 'Nhà hàng' },
  { kana: 'デパート', meaning_vi: 'Cửa hàng bách hóa' },

  // ── Transportation ──
  { kana: 'くるま', kanji: '車', meaning_vi: 'Xe hơi, Ô tô' },
  { kana: 'でんしゃ', kanji: '電車', meaning_vi: 'Tàu điện' },
  { kana: 'バス', meaning_vi: 'Xe buýt' },
  { kana: 'タクシー', meaning_vi: 'Taxi' },
  { kana: 'じてんしゃ', kanji: '自転車', meaning_vi: 'Xe đạp' },
  { kana: 'ひこうき', kanji: '飛行機', meaning_vi: 'Máy bay' },
  { kana: 'ふね', kanji: '船', meaning_vi: 'Tàu, Thuyền' },
  { kana: 'ちかてつ', kanji: '地下鉄', meaning_vi: 'Tàu điện ngầm' },
  { kana: 'みち', kanji: '道', meaning_vi: 'Đường, Con đường' },

  // ── Daily Objects ──
  { kana: 'ほん', kanji: '本', meaning_vi: 'Sách' },
  { kana: 'じしょ', kanji: '辞書', meaning_vi: 'Từ điển' },
  { kana: 'ざっし', kanji: '雑誌', meaning_vi: 'Tạp chí' },
  { kana: 'しんぶん', kanji: '新聞', meaning_vi: 'Báo' },
  { kana: 'てがみ', kanji: '手紙', meaning_vi: 'Thư (viết tay)' },
  { kana: 'かさ', kanji: '傘', meaning_vi: 'Ô, Dù' },
  { kana: 'かばん', meaning_vi: 'Cặp, Túi xách' },
  { kana: 'くつ', kanji: '靴', meaning_vi: 'Giày' },
  { kana: 'ふく', kanji: '服', meaning_vi: 'Quần áo' },
  { kana: 'とけい', kanji: '時計', meaning_vi: 'Đồng hồ' },
  { kana: 'でんわ', kanji: '電話', meaning_vi: 'Điện thoại' },
  { kana: 'かぎ', kanji: '鍵', meaning_vi: 'Chìa khóa' },
  { kana: 'まど', kanji: '窓', meaning_vi: 'Cửa sổ' },
  { kana: 'ドア', meaning_vi: 'Cửa' },
  { kana: 'つくえ', kanji: '机', meaning_vi: 'Bàn học, Bàn làm việc' },
  { kana: 'いす', kanji: '椅子', meaning_vi: 'Ghế' },
  { kana: 'テレビ', meaning_vi: 'TV, Tivi' },
  { kana: 'ラジオ', meaning_vi: 'Radio, Đài' },
  { kana: 'カメラ', meaning_vi: 'Máy ảnh' },
  { kana: 'コンピューター', meaning_vi: 'Máy tính' },
  { kana: 'パソコン', meaning_vi: 'Máy tính cá nhân' },
  { kana: 'おかね', kanji: 'お金', meaning_vi: 'Tiền' },
  { kana: 'きっぷ', kanji: '切符', meaning_vi: 'Vé' },

  // ── Colors ──
  { kana: 'あか', kanji: '赤', meaning_vi: 'Màu đỏ' },
  { kana: 'あお', kanji: '青', meaning_vi: 'Màu xanh dương' },
  { kana: 'しろ', kanji: '白', meaning_vi: 'Màu trắng' },
  { kana: 'くろ', kanji: '黒', meaning_vi: 'Màu đen' },
  { kana: 'きいろ', kanji: '黄色', meaning_vi: 'Màu vàng' },
  { kana: 'みどり', kanji: '緑', meaning_vi: 'Màu xanh lá' },

  // ── Nature ──
  { kana: 'やま', kanji: '山', meaning_vi: 'Núi' },
  { kana: 'かわ', kanji: '川', meaning_vi: 'Sông' },
  { kana: 'うみ', kanji: '海', meaning_vi: 'Biển' },
  { kana: 'そら', kanji: '空', meaning_vi: 'Bầu trời' },
  { kana: 'あめ', kanji: '雨', meaning_vi: 'Mưa' },
  { kana: 'ゆき', kanji: '雪', meaning_vi: 'Tuyết' },
  { kana: 'かぜ', kanji: '風', meaning_vi: 'Gió' },
  { kana: 'はな', kanji: '花', meaning_vi: 'Hoa' },
  { kana: 'き', kanji: '木', meaning_vi: 'Cây' },
  { kana: 'ほし', kanji: '星', meaning_vi: 'Ngôi sao' },
  { kana: 'ひ', kanji: '日', meaning_vi: 'Mặt trời' },
  { kana: 'つき', kanji: '月', meaning_vi: 'Mặt trăng' },
  { kana: 'てんき', kanji: '天気', meaning_vi: 'Thời tiết' },

  // ── Animals ──
  { kana: 'いぬ', kanji: '犬', meaning_vi: 'Chó' },
  { kana: 'ねこ', kanji: '猫', meaning_vi: 'Mèo' },
  { kana: 'とり', kanji: '鳥', meaning_vi: 'Chim' },
  { kana: 'うし', kanji: '牛', meaning_vi: 'Bò' },
  { kana: 'うま', kanji: '馬', meaning_vi: 'Ngựa' },
  { kana: 'さかな', kanji: '魚', meaning_vi: 'Cá' },
  { kana: 'むし', kanji: '虫', meaning_vi: 'Côn trùng, Sâu bọ' },

  // ── Verbs (dictionary form) ──
  { kana: 'する', meaning_vi: 'Làm' },
  { kana: 'くる', kanji: '来る', meaning_vi: 'Đến' },
  { kana: 'いく', kanji: '行く', meaning_vi: 'Đi' },
  { kana: 'みる', kanji: '見る', meaning_vi: 'Nhìn, Xem' },
  { kana: 'たべる', kanji: '食べる', meaning_vi: 'Ăn' },
  { kana: 'のむ', kanji: '飲む', meaning_vi: 'Uống' },
  { kana: 'かう', kanji: '買う', meaning_vi: 'Mua' },
  { kana: 'よむ', kanji: '読む', meaning_vi: 'Đọc' },
  { kana: 'かく', kanji: '書く', meaning_vi: 'Viết' },
  { kana: 'きく', kanji: '聞く', meaning_vi: 'Nghe, Hỏi' },
  { kana: 'はなす', kanji: '話す', meaning_vi: 'Nói, Nói chuyện' },
  { kana: 'いう', kanji: '言う', meaning_vi: 'Nói' },
  { kana: 'おもう', kanji: '思う', meaning_vi: 'Nghĩ' },
  { kana: 'わかる', kanji: '分かる', meaning_vi: 'Hiểu' },
  { kana: 'しる', kanji: '知る', meaning_vi: 'Biết' },
  { kana: 'ある', meaning_vi: 'Có, Tồn tại (vật)' },
  { kana: 'いる', kanji: '居る', meaning_vi: 'Có, Ở (người, động vật)' },
  { kana: 'なる', meaning_vi: 'Trở thành, Trở nên' },
  { kana: 'つくる', kanji: '作る', meaning_vi: 'Làm, Chế tạo, Tạo ra' },
  { kana: 'つかう', kanji: '使う', meaning_vi: 'Sử dụng, Dùng' },
  { kana: 'ねる', kanji: '寝る', meaning_vi: 'Ngủ' },
  { kana: 'おきる', kanji: '起きる', meaning_vi: 'Thức dậy' },
  { kana: 'はたらく', kanji: '働く', meaning_vi: 'Làm việc' },
  { kana: 'べんきょうする', kanji: '勉強する', meaning_vi: 'Học, Học tập' },
  { kana: 'おしえる', kanji: '教える', meaning_vi: 'Dạy' },
  { kana: 'ならう', kanji: '習う', meaning_vi: 'Học (từ ai đó)' },
  { kana: 'あう', kanji: '会う', meaning_vi: 'Gặp' },
  { kana: 'まつ', kanji: '待つ', meaning_vi: 'Đợi, Chờ' },
  { kana: 'とる', kanji: '取る', meaning_vi: 'Lấy' },
  { kana: 'あげる', meaning_vi: 'Cho, Tặng, Đưa lên' },
  { kana: 'もらう', meaning_vi: 'Nhận (từ ai đó)' },
  { kana: 'くれる', meaning_vi: 'Cho (tôi)' },
  { kana: 'のる', kanji: '乗る', meaning_vi: 'Lên (xe), Đi (phương tiện)' },
  { kana: 'おりる', kanji: '降りる', meaning_vi: 'Xuống (xe)' },
  { kana: 'あるく', kanji: '歩く', meaning_vi: 'Đi bộ' },
  { kana: 'はしる', kanji: '走る', meaning_vi: 'Chạy' },
  { kana: 'すわる', kanji: '座る', meaning_vi: 'Ngồi' },
  { kana: 'たつ', kanji: '立つ', meaning_vi: 'Đứng' },
  { kana: 'あける', kanji: '開ける', meaning_vi: 'Mở' },
  { kana: 'しめる', kanji: '閉める', meaning_vi: 'Đóng' },
  { kana: 'つける', meaning_vi: 'Bật (đèn, TV)' },
  { kana: 'けす', kanji: '消す', meaning_vi: 'Tắt (đèn, TV), Xóa' },
  { kana: 'はいる', kanji: '入る', meaning_vi: 'Vào, Đi vào' },
  { kana: 'でる', kanji: '出る', meaning_vi: 'Ra, Đi ra' },
  { kana: 'かえる', kanji: '帰る', meaning_vi: 'Về, Trở về' },
  { kana: 'やすむ', kanji: '休む', meaning_vi: 'Nghỉ ngơi, Nghỉ' },
  { kana: 'およぐ', kanji: '泳ぐ', meaning_vi: 'Bơi' },
  { kana: 'うたう', kanji: '歌う', meaning_vi: 'Hát' },
  { kana: 'あそぶ', kanji: '遊ぶ', meaning_vi: 'Chơi' },

  // ── い Adjectives ──
  { kana: 'おおきい', kanji: '大きい', meaning_vi: 'Lớn, To' },
  { kana: 'ちいさい', kanji: '小さい', meaning_vi: 'Nhỏ, Bé' },
  { kana: 'あたらしい', kanji: '新しい', meaning_vi: 'Mới' },
  { kana: 'ふるい', kanji: '古い', meaning_vi: 'Cũ' },
  { kana: 'いい', meaning_vi: 'Tốt, Hay' },
  { kana: 'わるい', kanji: '悪い', meaning_vi: 'Xấu, Tệ' },
  { kana: 'たかい', kanji: '高い', meaning_vi: 'Cao, Đắt' },
  { kana: 'ひくい', kanji: '低い', meaning_vi: 'Thấp' },
  { kana: 'やすい', kanji: '安い', meaning_vi: 'Rẻ' },
  { kana: 'おいしい', kanji: '美味しい', meaning_vi: 'Ngon' },
  { kana: 'まずい', meaning_vi: 'Dở, Không ngon' },
  { kana: 'あつい', kanji: '暑い', meaning_vi: 'Nóng (thời tiết)' },
  { kana: 'さむい', kanji: '寒い', meaning_vi: 'Lạnh (thời tiết)' },
  { kana: 'あたたかい', kanji: '暖かい', meaning_vi: 'Ấm áp' },
  { kana: 'すずしい', kanji: '涼しい', meaning_vi: 'Mát mẻ' },
  { kana: 'つめたい', kanji: '冷たい', meaning_vi: 'Lạnh (chạm vào)' },
  { kana: 'あつい', kanji: '熱い', meaning_vi: 'Nóng (vật thể)' },
  { kana: 'たのしい', kanji: '楽しい', meaning_vi: 'Vui, Thú vị' },
  { kana: 'かなしい', kanji: '悲しい', meaning_vi: 'Buồn' },
  { kana: 'いそがしい', kanji: '忙しい', meaning_vi: 'Bận rộn' },
  { kana: 'おもしろい', meaning_vi: 'Thú vị, Hài hước' },
  { kana: 'つまらない', meaning_vi: 'Chán, Nhàm chán' },
  { kana: 'からい', kanji: '辛い', meaning_vi: 'Cay' },
  { kana: 'あまい', kanji: '甘い', meaning_vi: 'Ngọt' },
  { kana: 'ちかい', kanji: '近い', meaning_vi: 'Gần' },
  { kana: 'とおい', kanji: '遠い', meaning_vi: 'Xa' },
  { kana: 'はやい', kanji: '速い', meaning_vi: 'Nhanh' },
  { kana: 'おそい', kanji: '遅い', meaning_vi: 'Chậm, Muộn' },
  { kana: 'ひろい', kanji: '広い', meaning_vi: 'Rộng' },
  { kana: 'せまい', kanji: '狭い', meaning_vi: 'Hẹp' },
  { kana: 'ながい', kanji: '長い', meaning_vi: 'Dài' },
  { kana: 'みじかい', kanji: '短い', meaning_vi: 'Ngắn' },
  { kana: 'あかるい', kanji: '明るい', meaning_vi: 'Sáng' },
  { kana: 'くらい', kanji: '暗い', meaning_vi: 'Tối' },
  { kana: 'おもい', kanji: '重い', meaning_vi: 'Nặng' },
  { kana: 'かるい', kanji: '軽い', meaning_vi: 'Nhẹ' },
  { kana: 'むずかしい', kanji: '難しい', meaning_vi: 'Khó' },
  { kana: 'やさしい', kanji: '易しい', meaning_vi: 'Dễ' },
  { kana: 'つよい', kanji: '強い', meaning_vi: 'Mạnh' },
  { kana: 'よわい', kanji: '弱い', meaning_vi: 'Yếu' },

  // ── な Adjectives ──
  { kana: 'すき', kanji: '好き', meaning_vi: 'Thích, Yêu thích' },
  { kana: 'きらい', kanji: '嫌い', meaning_vi: 'Ghét, Không thích' },
  { kana: 'きれい', meaning_vi: 'Đẹp, Sạch sẽ' },
  { kana: 'しずか', kanji: '静か', meaning_vi: 'Yên tĩnh' },
  { kana: 'にぎやか', meaning_vi: 'Náo nhiệt, Sầm uất' },
  { kana: 'ゆうめい', kanji: '有名', meaning_vi: 'Nổi tiếng' },
  { kana: 'げんき', kanji: '元気', meaning_vi: 'Khỏe mạnh, Vui vẻ' },
  { kana: 'じょうず', kanji: '上手', meaning_vi: 'Giỏi, Khéo' },
  { kana: 'へた', kanji: '下手', meaning_vi: 'Kém, Dở' },
  { kana: 'たいせつ', kanji: '大切', meaning_vi: 'Quan trọng, Quý trọng' },
  { kana: 'だいじょうぶ', kanji: '大丈夫', meaning_vi: 'Không sao, Ổn' },
  { kana: 'べんり', kanji: '便利', meaning_vi: 'Tiện lợi' },
  { kana: 'ふべん', kanji: '不便', meaning_vi: 'Bất tiện' },
  { kana: 'いろいろ', meaning_vi: 'Nhiều loại, Đa dạng' },
  { kana: 'かんたん', kanji: '簡単', meaning_vi: 'Đơn giản' },
  { kana: 'ひま', kanji: '暇', meaning_vi: 'Rảnh rỗi' },

  // ── Adverbs & Expressions ──
  { kana: 'とても', meaning_vi: 'Rất' },
  { kana: 'すこし', kanji: '少し', meaning_vi: 'Một chút, Ít' },
  { kana: 'ちょっと', meaning_vi: 'Một chút (thân mật)' },
  { kana: 'いつも', meaning_vi: 'Luôn luôn' },
  { kana: 'よく', meaning_vi: 'Thường xuyên, Tốt' },
  { kana: 'ときどき', kanji: '時々', meaning_vi: 'Thỉnh thoảng' },
  { kana: 'あまり', meaning_vi: 'Không...lắm (phủ định)' },
  { kana: 'ぜんぜん', kanji: '全然', meaning_vi: 'Hoàn toàn không' },
  { kana: 'たいてい', meaning_vi: 'Thường thường, Đại khái' },
  { kana: 'たくさん', meaning_vi: 'Nhiều' },
  { kana: 'もう', meaning_vi: 'Đã, Rồi' },
  { kana: 'まだ', meaning_vi: 'Vẫn, Chưa' },
  { kana: 'いちばん', kanji: '一番', meaning_vi: 'Nhất, Số một' },
  { kana: 'はじめて', kanji: '初めて', meaning_vi: 'Lần đầu tiên' },
  { kana: 'ゆっくり', meaning_vi: 'Chậm rãi, Từ từ' },
  { kana: 'すぐ', meaning_vi: 'Ngay lập tức' },
  { kana: 'だいたい', kanji: '大体', meaning_vi: 'Đại khái, Khoảng' },
  { kana: 'もちろん', meaning_vi: 'Tất nhiên, Đương nhiên' },
  { kana: 'どうぞ', meaning_vi: 'Xin mời' },
  { kana: 'どうも', meaning_vi: 'Cảm ơn / Xin lỗi (nhẹ)' },
  { kana: 'また', meaning_vi: 'Lại, Lần nữa' },

  // ── Question words ──
  { kana: 'なに', kanji: '何', meaning_vi: 'Cái gì' },
  { kana: 'なん', kanji: '何', meaning_vi: 'Cái gì (dạng rút gọn)' },
  { kana: 'だれ', kanji: '誰', meaning_vi: 'Ai' },
  { kana: 'いつ', meaning_vi: 'Khi nào' },
  { kana: 'どこ', meaning_vi: 'Ở đâu' },
  { kana: 'なぜ', meaning_vi: 'Tại sao' },
  { kana: 'どうして', meaning_vi: 'Tại sao, Như thế nào' },
  { kana: 'どう', meaning_vi: 'Thế nào, Như thế nào' },
  { kana: 'どんな', meaning_vi: 'Loại gì, Như thế nào' },
  { kana: 'どのくらい', meaning_vi: 'Khoảng bao nhiêu, Bao lâu' },
  { kana: 'いくら', meaning_vi: 'Bao nhiêu (tiền)' },
  { kana: 'いくつ', meaning_vi: 'Mấy cái, Bao nhiêu tuổi' },
  { kana: 'どちら', meaning_vi: 'Cái nào, Phía nào (lịch sự)' },
  { kana: 'どれ', meaning_vi: 'Cái nào' },

  // ── Pronouns & Demonstratives ──
  { kana: 'わたし', kanji: '私', meaning_vi: 'Tôi' },
  { kana: 'あなた', meaning_vi: 'Bạn, Anh/Chị' },
  { kana: 'かれ', kanji: '彼', meaning_vi: 'Anh ấy, Bạn trai' },
  { kana: 'かのじょ', kanji: '彼女', meaning_vi: 'Cô ấy, Bạn gái' },
  { kana: 'これ', meaning_vi: 'Cái này' },
  { kana: 'それ', meaning_vi: 'Cái đó' },
  { kana: 'あれ', meaning_vi: 'Cái kia' },
  { kana: 'この', meaning_vi: 'Này (đứng trước danh từ)' },
  { kana: 'その', meaning_vi: 'Đó (đứng trước danh từ)' },
  { kana: 'あの', meaning_vi: 'Kia (đứng trước danh từ)' },
  { kana: 'ここ', meaning_vi: 'Ở đây' },
  { kana: 'そこ', meaning_vi: 'Ở đó' },
  { kana: 'あそこ', meaning_vi: 'Ở đằng kia' },

  // ── Greetings & Basic Phrases ──
  { kana: 'ありがとう', meaning_vi: 'Cảm ơn' },
  { kana: 'すみません', meaning_vi: 'Xin lỗi' },
  { kana: 'ごめんなさい', meaning_vi: 'Xin lỗi (thân mật)' },
  { kana: 'おはよう', meaning_vi: 'Chào buổi sáng' },
  { kana: 'こんにちは', meaning_vi: 'Xin chào' },
  { kana: 'こんばんは', meaning_vi: 'Chào buổi tối' },
  { kana: 'さようなら', meaning_vi: 'Tạm biệt' },
  { kana: 'はい', meaning_vi: 'Vâng, Dạ' },
  { kana: 'いいえ', meaning_vi: 'Không' },

  // ── Counters & Units ──
  { kana: 'ひとつ', kanji: '一つ', meaning_vi: 'Một cái' },
  { kana: 'ふたつ', kanji: '二つ', meaning_vi: 'Hai cái' },
  { kana: 'みっつ', kanji: '三つ', meaning_vi: 'Ba cái' },
  { kana: 'よっつ', kanji: '四つ', meaning_vi: 'Bốn cái' },
  { kana: 'いつつ', kanji: '五つ', meaning_vi: 'Năm cái' },
  { kana: 'むっつ', kanji: '六つ', meaning_vi: 'Sáu cái' },
  { kana: 'ななつ', kanji: '七つ', meaning_vi: 'Bảy cái' },
  { kana: 'やっつ', kanji: '八つ', meaning_vi: 'Tám cái' },
  { kana: 'ここのつ', kanji: '九つ', meaning_vi: 'Chín cái' },
  { kana: 'とお', kanji: '十', meaning_vi: 'Mười cái' },
  { kana: 'にん', kanji: '人', meaning_vi: 'Người (đếm người)' },
  { kana: 'まい', kanji: '枚', meaning_vi: 'Tờ, Tấm (đếm vật mỏng)' },
  { kana: 'だい', kanji: '台', meaning_vi: 'Cái, Chiếc (đếm máy móc)' },
  { kana: 'さつ', kanji: '冊', meaning_vi: 'Cuốn, Quyển (đếm sách)' },
  { kana: 'ほん', kanji: '本', meaning_vi: 'Cây, Chiếc (đếm vật dài)' },
  { kana: 'えん', kanji: '円', meaning_vi: 'Yên (tiền Nhật)' },

  // ── Weather & Seasons ──
  { kana: 'はる', kanji: '春', meaning_vi: 'Mùa xuân' },
  { kana: 'なつ', kanji: '夏', meaning_vi: 'Mùa hè' },
  { kana: 'あき', kanji: '秋', meaning_vi: 'Mùa thu' },
  { kana: 'ふゆ', kanji: '冬', meaning_vi: 'Mùa đông' },
];

// ── Main ──────────────────────────────────────────────────────────────────

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  console.log(`Adding Vietnamese meanings for ${N5_WORDS.length} N5 words...`);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Prepare statements: match by (kanji + kana), then (kana only), then (kana LIKE)
  const matchExact = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND kanji = ?");
  const matchKana = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND meaning_vi = ''");
  const matchLike = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana LIKE ? AND meaning_vi = ''");

  let exactMatches = 0;
  let kanaMatches = 0;
  let likeMatches = 0;
  let noMatch = 0;

  const updateBatch = db.transaction(() => {
    for (const word of N5_WORDS) {
      // Try exact match (kanji + kana)
      if (word.kanji) {
        const r = matchExact.run(word.meaning_vi, word.kana, word.kanji);
        if (r.changes > 0) { exactMatches++; continue; }
      }

      // Try kana-only match
      const r2 = matchKana.run(word.meaning_vi, word.kana);
      if (r2.changes > 0) { kanaMatches++; continue; }

      // Try kana like match (for words with okurigana variations)
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

  // Show updated count
  const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN meaning_vi != '' THEN 1 ELSE 0 END) as with_vi FROM words").get() as { total: number; with_vi: number };
  console.log(`\nTotal words with Vietnamese: ${stats.with_vi} / ${stats.total}`);

  // Show some samples
  const samples = db.prepare("SELECT kanji, kana, meaning_vi, meaning_en FROM words WHERE meaning_vi != '' ORDER BY id LIMIT 8").all() as { kanji: string; kana: string; meaning_vi: string; meaning_en: string }[];
  console.log('\nSample updated entries:');
  for (const s of samples) {
    console.log(`  ${s.kanji.padEnd(8)} ${s.kana.padEnd(12)} → ${s.meaning_vi.padEnd(25)} | ${s.meaning_en.substring(0, 45)}`);
  }

  db.close();
  console.log('\nDone!');
}

main();
