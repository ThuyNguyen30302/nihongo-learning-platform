/**
 * add-n2-vietnamese.ts — N2 vocabulary → update words.meaning_vi
 * Usage:  npx ts-node scripts/add-n2-vietnamese.ts
 */
import Database from 'better-sqlite3';
import * as path from 'path';

const WORDS: { kana: string; kanji?: string; meaning_vi: string }[] = [
  // ── Verbs ──
  { kana: 'あいまい', kanji: '曖昧', meaning_vi: 'Mơ hồ, Không rõ ràng' },
  { kana: 'あしからず', kanji: '悪しからず', meaning_vi: 'Xin đừng giận, Mong thông cảm' },
  { kana: 'あやまる', kanji: '謝る', meaning_vi: 'Xin lỗi' },
  { kana: 'あらためる', kanji: '改める', meaning_vi: 'Sửa đổi, Cải cách' },
  { kana: 'いとなむ', kanji: '営む', meaning_vi: 'Kinh doanh, Điều hành' },
  { kana: 'うけとる', kanji: '受け取る', meaning_vi: 'Nhận (vật, thông điệp)' },
  { kana: 'うったえる', kanji: '訴える', meaning_vi: 'Khiếu nại, Kháng cáo, Kêu gọi' },
  { kana: 'うながす', kanji: '促す', meaning_vi: 'Thúc đẩy, Khuyến khích, Giục' },
  { kana: 'うらぎる', kanji: '裏切る', meaning_vi: 'Phản bội' },
  { kana: 'えがく', kanji: '描く', meaning_vi: 'Vẽ, Miêu tả' },
  { kana: 'おぎなう', kanji: '補う', meaning_vi: 'Bổ sung, Bù đắp' },
  { kana: 'おさめる', kanji: '収める', meaning_vi: 'Thu vào, Đạt được (kết quả)' },
  { kana: 'おそれる', kanji: '恐れる', meaning_vi: 'Sợ hãi, Lo sợ' },
  { kana: 'かかえる', kanji: '抱える', meaning_vi: 'Ôm, Mang (vấn đề, gánh nặng)' },
  { kana: 'かたる', kanji: '語る', meaning_vi: 'Kể, Kể chuyện' },
  { kana: 'かまう', kanji: '構う', meaning_vi: 'Bận tâm, Quan tâm' },
  { kana: 'かれる', kanji: '枯れる', meaning_vi: 'Khô héo (cây), Tàn lụi' },
  { kana: 'かんする', kanji: '関する', meaning_vi: 'Liên quan đến' },
  { kana: 'きざむ', kanji: '刻む', meaning_vi: 'Khắc, Ghi khắc, Băm nhỏ' },
  { kana: 'きたえる', kanji: '鍛える', meaning_vi: 'Rèn luyện, Tôi luyện' },
  { kana: 'きょうじる', kanji: '興じる', meaning_vi: 'Say mê, Thích thú' },
  { kana: 'きりかえる', kanji: '切り替える', meaning_vi: 'Chuyển đổi, Thay đổi' },
  { kana: 'くちずさむ', kanji: '口ずさむ', meaning_vi: 'Ngân nga, Hát khe khẽ' },
  { kana: 'くみたてる', kanji: '組み立てる', meaning_vi: 'Lắp ráp, Xây dựng' },
  { kana: 'けいやくする', kanji: '契約する', meaning_vi: 'Ký hợp đồng' },
  { kana: 'けずる', kanji: '削る', meaning_vi: 'Gọt, Cắt giảm' },
  { kana: 'ことづける', kanji: '言付ける', meaning_vi: 'Nhắn gửi, Gửi lời' },
  { kana: 'さかのぼる', kanji: '遡る', meaning_vi: 'Ngược dòng, Truy ngược (thời gian)' },
  { kana: 'さからう', kanji: '逆らう', meaning_vi: 'Chống lại, Làm trái, Ngược' },
  { kana: 'ささる', kanji: '刺さる', meaning_vi: 'Đâm vào, Cắm vào (tự động)' },
  { kana: 'さだめる', kanji: '定める', meaning_vi: 'Quy định, Ấn định' },
  { kana: 'しくじる', meaning_vi: 'Thất bại, Làm hỏng, Vấp ngã' },
  { kana: 'したがう', kanji: '従う', meaning_vi: 'Tuân theo, Làm theo' },
  { kana: 'しばる', kanji: '縛る', meaning_vi: 'Trói, Buộc, Ràng buộc' },
  { kana: 'しぼむ', kanji: '萎む', meaning_vi: 'Héo, Xẹp xuống' },
  { kana: 'しゃぶる', meaning_vi: 'Mút, Ngậm' },
  { kana: 'じゅくれん', kanji: '熟練', meaning_vi: 'Thành thạo, Lành nghề' },
  { kana: 'しょうきょする', kanji: '消去する', meaning_vi: 'Xóa bỏ' },
  { kana: 'しんにゅうする', kanji: '進入する', meaning_vi: 'Đi vào, Xâm nhập' },
  { kana: 'すいせんする', kanji: '推薦する', meaning_vi: 'Tiến cử, Đề cử' },
  { kana: 'すます', kanji: '済ます', meaning_vi: 'Hoàn thành, Xong xuôi' },
  { kana: 'せめる', kanji: '攻める', meaning_vi: 'Tấn công' },
  { kana: 'そうちする', kanji: '装置する', meaning_vi: 'Lắp đặt (thiết bị)' },
  { kana: 'そなわる', kanji: '備わる', meaning_vi: 'Được trang bị, Có sẵn (tự động)' },
  { kana: 'そびえる', kanji: '聳える', meaning_vi: 'Sừng sững, Cao vút' },
  { kana: 'そる', kanji: '剃る', meaning_vi: 'Cạo (râu)' },
  { kana: 'たいおうする', kanji: '対応する', meaning_vi: 'Đối ứng, Xử lý, Tương thích' },
  { kana: 'たえる', kanji: '絶える', meaning_vi: 'Tuyệt chủng, Hết, Dứt' },
  { kana: 'たくわえる', kanji: '蓄える', meaning_vi: 'Tích trữ, Dự trữ' },
  { kana: 'たっせいする', kanji: '達成する', meaning_vi: 'Đạt được (mục tiêu)' },
  { kana: 'たとえる', kanji: '例える', meaning_vi: 'So sánh, Ví von' },
  { kana: 'ためす', kanji: '試す', meaning_vi: 'Thử, Kiểm tra' },
  { kana: 'ちかづける', kanji: '近づける', meaning_vi: 'Đưa lại gần (chủ động)' },
  { kana: 'ついやす', kanji: '費やす', meaning_vi: 'Tiêu tốn (thời gian, tiền bạc)' },
  { kana: 'つくす', kanji: '尽くす', meaning_vi: 'Dốc hết, Làm hết sức' },
  { kana: 'つつしむ', kanji: '慎む', meaning_vi: 'Kiềm chế, Thận trọng' },
  { kana: 'つとめ', kanji: '務め', meaning_vi: 'Nghĩa vụ, Bổn phận' },
  { kana: 'つぶやく', kanji: '呟く', meaning_vi: 'Lẩm bẩm, Thì thầm' },
  { kana: 'つらなる', kanji: '連なる', meaning_vi: 'Nối tiếp, Trải dài' },
  { kana: 'ていきょうする', kanji: '提供する', meaning_vi: 'Cung cấp' },
  { kana: 'てきする', kanji: '適する', meaning_vi: 'Phù hợp, Thích hợp' },
  { kana: 'でくわす', kanji: '出くわす', meaning_vi: 'Tình cờ gặp, Đụng phải' },

  // ── Nouns ──
  { kana: 'かんよう', kanji: '慣用', meaning_vi: 'Thường dùng, Quen dùng' },
  { kana: 'きじゅん', kanji: '基準', meaning_vi: 'Tiêu chuẩn' },
  { kana: 'きてい', kanji: '規定', meaning_vi: 'Quy định' },
  { kana: 'ぎむ', kanji: '義務', meaning_vi: 'Nghĩa vụ' },
  { kana: 'けんり', kanji: '権利', meaning_vi: 'Quyền lợi' },
  { kana: 'こうりつ', kanji: '効率', meaning_vi: 'Hiệu suất' },
  { kana: 'しさん', kanji: '資産', meaning_vi: 'Tài sản' },
  { kana: 'しさんか', kanji: '資産家', meaning_vi: 'Người giàu có' },
  { kana: 'しゅうえき', kanji: '収益', meaning_vi: 'Lợi nhuận, Thu nhập' },
  { kana: 'しょうきょくてき', kanji: '消極的', meaning_vi: 'Tiêu cực, Thụ động' },
  { kana: 'しょうとつ', kanji: '衝突', meaning_vi: 'Va chạm, Xung đột' },
  { kana: 'しんらい', kanji: '信頼', meaning_vi: 'Tin tưởng, Tín nhiệm' },
  { kana: 'すいこう', kanji: '遂行', meaning_vi: 'Thực thi, Hoàn thành' },
  { kana: 'せつりつ', kanji: '設立', meaning_vi: 'Thành lập' },
  { kana: 'そんざい', kanji: '存在', meaning_vi: 'Sự tồn tại' },
  { kana: 'ちゅうじつ', kanji: '忠実', meaning_vi: 'Trung thành' },
  { kana: 'とうけい', kanji: '統計', meaning_vi: 'Thống kê' },
  { kana: 'どくさい', kanji: '独裁', meaning_vi: 'Độc tài' },
  { kana: 'ひとりごと', kanji: '独り言', meaning_vi: 'Nói một mình' },
  { kana: 'ふうさ', kanji: '封鎖', meaning_vi: 'Phong tỏa' },
  { kana: 'ぶっしつ', kanji: '物質', meaning_vi: 'Vật chất' },
  { kana: 'へんけん', kanji: '偏見', meaning_vi: 'Thành kiến, Định kiến' },
  { kana: 'まんせい', kanji: '慢性', meaning_vi: 'Mạn tính, Kéo dài' },
  { kana: 'みほん', kanji: '見本', meaning_vi: 'Mẫu, Mẫu hàng' },
  { kana: 'めいよ', kanji: '名誉', meaning_vi: 'Danh dự, Vinh dự' },
  { kana: 'ようしき', kanji: '様式', meaning_vi: 'Kiểu dáng, Hình thức' },
  { kana: 'らんよう', kanji: '乱用', meaning_vi: 'Lạm dụng' },

  // ── Adjectives / Adverbs / na-adj ──
  { kana: 'あいにく', meaning_vi: 'Thật không may, Đáng tiếc' },
  { kana: 'あくまで', meaning_vi: 'Đến cùng, Kiên quyết' },
  { kana: 'あたりまえ', kanji: '当たり前', meaning_vi: 'Hiển nhiên, Đương nhiên' },
  { kana: 'あらゆる', meaning_vi: 'Mọi, Tất cả các' },
  { kana: 'いくじなし', kanji: '意気地なし', meaning_vi: 'Kẻ hèn nhát, Nhát gan' },
  { kana: 'いちじるしい', kanji: '著しい', meaning_vi: 'Đáng kể, Rõ rệt' },
  { kana: 'いやいや', meaning_vi: 'Miễn cưỡng, Không muốn' },
  { kana: 'おおざっぱ', kanji: '大雑把', meaning_vi: 'Đại khái, Qua loa' },
  { kana: 'おしい', kanji: '惜しい', meaning_vi: 'Tiếc nuối, Đáng tiếc' },
  { kana: 'おびただしい', kanji: '夥しい', meaning_vi: 'Vô số, Rất nhiều' },
  { kana: 'かくじつ', kanji: '確実', meaning_vi: 'Chắc chắn, Đáng tin cậy' },
  { kana: 'きさく', kanji: '気さく', meaning_vi: 'Thân thiện, Dễ gần' },
  { kana: 'きゅうそく', kanji: '急速', meaning_vi: 'Nhanh chóng, Cấp tốc' },
  { kana: 'きょうれつ', kanji: '強烈', meaning_vi: 'Mãnh liệt, Dữ dội' },
  { kana: 'きわめて', kanji: '極めて', meaning_vi: 'Cực kỳ, Vô cùng' },
  { kana: 'ぐち', kanji: '愚痴', meaning_vi: 'Lời than phiền, Càu nhàu' },
  { kana: 'げんじつ', kanji: '現実', meaning_vi: 'Hiện thực, Thực tế' },
  { kana: 'こうへい', kanji: '公平', meaning_vi: 'Công bằng' },
  { kana: 'さいてき', kanji: '最適', meaning_vi: 'Tối ưu, Phù hợp nhất' },
  { kana: 'しなやか', meaning_vi: 'Mềm dẻo, Uyển chuyển' },
  { kana: 'しんけん', kanji: '真剣', meaning_vi: 'Nghiêm túc (cực độ)' },
  { kana: 'せいぜい', meaning_vi: 'Cùng lắm, Nhiều nhất là' },
  { kana: 'たやすい', meaning_vi: 'Dễ dàng, Đơn giản' },
  { kana: 'てきかく', kanji: '的確', meaning_vi: 'Chính xác, Chuẩn xác' },
  { kana: 'なさけない', kanji: '情けない', meaning_vi: 'Đáng thương, Thảm hại' },
  { kana: 'なにげない', kanji: '何気ない', meaning_vi: 'Vô tình, Không chủ ý' },
  { kana: 'なめらか', kanji: '滑らか', meaning_vi: 'Trơn tru, Mượt mà' },
  { kana: 'ふうん', kanji: '不運', meaning_vi: 'Không may, Xui xẻo' },
];

function main() {
  const dbPath = path.join(path.resolve(__dirname, '..'), 'data', 'dictionary.db');
  console.log(`Adding N2 words: ${WORDS.length}...`);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  const m1 = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND kanji = ? AND meaning_vi = ''");
  const m2 = db.prepare("UPDATE words SET meaning_vi = ? WHERE kana = ? AND meaning_vi = ''");
  let e = 0, k = 0, n = 0;
  db.transaction(() => { for (const w of WORDS) { if (w.kanji) { const r = m1.run(w.meaning_vi, w.kana, w.kanji); if (r.changes > 0) { e++; continue; } } const r2 = m2.run(w.meaning_vi, w.kana); if (r2.changes > 0) { k++; continue; } n++; } })();
  console.log(`Exact: ${e} | Kana: ${k} | No match: ${n}`);
  const s = db.prepare("SELECT SUM(CASE WHEN meaning_vi != '' THEN 1 ELSE 0 END) as c FROM words").get() as { c: number };
  console.log(`Total: ${s.c}`);
  db.close();
}
main();
