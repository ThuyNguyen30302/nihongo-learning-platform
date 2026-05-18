/**
 * add-n1-vietnamese.ts — N1 vocabulary → update words.meaning_vi
 * Usage:  npx ts-node scripts/add-n1-vietnamese.ts
 */
import Database from 'better-sqlite3';
import * as path from 'path';

const WORDS: { kana: string; kanji?: string; meaning_vi: string }[] = [
  { kana: 'あいくち', kanji: '合口', meaning_vi: 'Hợp khẩu vị, Dao găm Nhật' },
  { kana: 'あいまって', kanji: '相俟って', meaning_vi: 'Kết hợp với, Cùng với' },
  { kana: 'あおり', kanji: '煽り', meaning_vi: 'Ảnh hưởng gián tiếp, Tác động dây chuyền' },
  { kana: 'あがく', kanji: '足掻く', meaning_vi: 'Vùng vẫy, Giãy giụa, Chống cự' },
  { kana: 'あきれる', kanji: '呆れる', meaning_vi: 'Sửng sốt, Kinh ngạc (tiêu cực)' },
  { kana: 'あさましい', kanji: '浅ましい', meaning_vi: 'Đáng khinh, Hèn hạ, Thảm hại' },
  { kana: 'あずかる', kanji: '与る', meaning_vi: 'Tham gia, Góp phần, Được nhờ' },
  { kana: 'あっけない', kanji: '呆気ない', meaning_vi: 'Quá đơn giản, Dễ đến bất ngờ' },
  { kana: 'あつれき', kanji: '軋轢', meaning_vi: 'Bất hòa, Mâu thuẫn, Xung đột' },
  { kana: 'あなどる', kanji: '侮る', meaning_vi: 'Coi thường, Khinh thường' },
  { kana: 'あまんじる', kanji: '甘んじる', meaning_vi: 'Cam chịu, Hài lòng với ít ỏi' },
  { kana: 'あやつる', kanji: '操る', meaning_vi: 'Thao túng, Điều khiển, Giật dây' },
  { kana: 'あらたまる', kanji: '改まる', meaning_vi: 'Được sửa đổi, Trở nên trang trọng' },
  { kana: 'あんのん', kanji: '安穏', meaning_vi: 'Yên ổn, An bình' },
  { kana: 'いいかげん', kanji: 'いい加減', meaning_vi: 'Qua loa, Đại khái, Vừa phải thôi' },
  { kana: 'いえいえ', meaning_vi: 'Không dám, Đâu có (khiêm tốn)' },
  { kana: 'いかる', kanji: '怒る', meaning_vi: 'Nổi giận, Phẫn nộ (văn chương)' },
  { kana: 'いくせい', kanji: '育成', meaning_vi: 'Đào tạo, Bồi dưỡng, Nuôi dưỡng' },
  { kana: 'いじゅう', kanji: '移住', meaning_vi: 'Di cư, Nhập cư' },
  { kana: 'いずみ', kanji: '泉', meaning_vi: 'Suối, Nguồn suối' },
  { kana: 'いせい', kanji: '異性', meaning_vi: 'Khác giới' },
  { kana: 'いちがいに', kanji: '一概に', meaning_vi: 'Không hẳn, Không thể nói chung' },
  { kana: 'いちじく', kanji: '無花果', meaning_vi: 'Quả sung, Quả vả' },
  { kana: 'いっかつ', kanji: '一括', meaning_vi: 'Gộp chung, Tổng hợp, Trọn gói' },
  { kana: 'いっさい', kanji: '一切', meaning_vi: 'Tất cả, Hoàn toàn (phủ định)' },
  { kana: 'いどう', kanji: '異動', meaning_vi: 'Điều chuyển, Thay đổi (nhân sự)' },
  { kana: 'いびつ', kanji: '歪', meaning_vi: 'Méo mó, Biến dạng, Bất thường' },
  { kana: 'いみん', kanji: '移民', meaning_vi: 'Dân nhập cư, Người di cư' },
  { kana: 'いやす', kanji: '癒やす', meaning_vi: 'Chữa lành, Xoa dịu (tâm hồn)' },
  { kana: 'うけつける', kanji: '受け付ける', meaning_vi: 'Tiếp nhận, Chấp nhận (đơn, hồ sơ)' },
  { kana: 'うごめく', kanji: '蠢く', meaning_vi: 'Ngọ nguậy, Luồn lách (ẩn dụ xã hội)' },
  { kana: 'うずめる', kanji: '埋める', meaning_vi: 'Chôn, Lấp đầy, Phủ kín' },
  { kana: 'うそぶく', kanji: '嘯く', meaning_vi: 'Khoác lác, Ba hoa, Giả vờ bình thản' },
  { kana: 'うちあける', kanji: '打ち明ける', meaning_vi: 'Thổ lộ, Tâm sự, Nói thật lòng' },
  { kana: 'うちきる', kanji: '打ち切る', meaning_vi: 'Kết thúc sớm, Đình chỉ, Ngừng' },
  { kana: 'うつむく', kanji: '俯く', meaning_vi: 'Cúi đầu (buồn, xấu hổ)' },
  { kana: 'うながす', kanji: '促す', meaning_vi: 'Thúc giục, Giục, Khuyến khích' },
  { kana: 'うらづける', kanji: '裏付ける', meaning_vi: 'Chứng minh, Xác thực, Củng cố (luận điểm)' },
  { kana: 'うりあげ', kanji: '売り上げ', meaning_vi: 'Doanh thu, Doanh số' },
  { kana: 'うわまわる', kanji: '上回る', meaning_vi: 'Vượt quá, Cao hơn (số liệu)' },
  { kana: 'えいせい', kanji: '衛生', meaning_vi: 'Vệ sinh' },
  { kana: 'えんかつ', kanji: '円滑', meaning_vi: 'Suôn sẻ, Trôi chảy, Thuận lợi' },
  { kana: 'えんきょく', kanji: '婉曲', meaning_vi: 'Nói giảm nói tránh, Uyển chuyển' },
  { kana: 'えんまん', kanji: '円満', meaning_vi: 'Hòa thuận, Êm đẹp, Viên mãn' },
  { kana: 'おおいに', kanji: '大いに', meaning_vi: 'Rất nhiều, Hết sức, Vô cùng' },
  { kana: 'おかす', kanji: '犯す', meaning_vi: 'Phạm (tội), Vi phạm, Xâm phạm' },
  { kana: 'おごる', kanji: '奢る', meaning_vi: 'Đãi, Bao (ăn uống), Xa xỉ' },
  { kana: 'おして', kanji: '押して', meaning_vi: 'Bất chấp, Cứ liều, Cố tình' },
  { kana: 'おしむ', kanji: '惜しむ', meaning_vi: 'Tiếc, Không nỡ, Quý trọng' },
  { kana: 'おしよせる', kanji: '押し寄せる', meaning_vi: 'Tràn vào, Ùa vào, Đổ dồn' },
  { kana: 'おびやかす', kanji: '脅かす', meaning_vi: 'Đe dọa, Uy hiếp' },
  { kana: 'おもむき', kanji: '趣', meaning_vi: 'Vẻ đẹp tinh tế, Hương vị đặc biệt' },
  { kana: 'およそ', kanji: '凡そ', meaning_vi: 'Khoảng, Đại khái, Nói chung' },
  { kana: 'かいしゅう', kanji: '回収', meaning_vi: 'Thu hồi' },
  { kana: 'かくしん', kanji: '革新', meaning_vi: 'Cải cách, Đổi mới, Cách mạng' },
  { kana: 'かさい', kanji: '火災', meaning_vi: 'Hỏa hoạn' },
  { kana: 'かたわら', kanji: '傍ら', meaning_vi: 'Bên cạnh, Đồng thời (làm thêm)' },
  { kana: 'かっき', kanji: '画期', meaning_vi: 'Mang tính đột phá, Cách mạng' },
  { kana: 'かびん', kanji: '過敏', meaning_vi: 'Quá nhạy cảm' },
  { kana: 'かねつ', kanji: '過熱', meaning_vi: 'Quá nhiệt, Nóng quá mức, Sốt (thị trường)' },
  { kana: 'かんかつ', kanji: '管轄', meaning_vi: 'Thẩm quyền, Phạm vi quản lý' },
  { kana: 'かんしゅう', kanji: '慣習', meaning_vi: 'Phong tục, Tập quán' },
  { kana: 'かんぺき', kanji: '完璧', meaning_vi: 'Hoàn hảo' },
  { kana: 'きかざる', kanji: '着飾る', meaning_vi: 'Trang điểm, Diện đồ đẹp' },
  { kana: 'ききめ', kanji: '効き目', meaning_vi: 'Tác dụng, Hiệu quả, Công hiệu' },
  { kana: 'きぐ', kanji: '器具', meaning_vi: 'Dụng cụ, Thiết bị' },
  { kana: 'きどる', kanji: '気取る', meaning_vi: 'Làm bộ, Tỏ vẻ, Tự phụ' },
  { kana: 'きひん', kanji: '気品', meaning_vi: 'Khí chất, Vẻ thanh cao, Phẩm cách' },
  { kana: 'きわどい', kanji: '際どい', meaning_vi: 'Sát nút, Hiểm hóc, Tế nhị' },
  { kana: 'くちばし', kanji: '嘴', meaning_vi: 'Mỏ (chim)' },
  { kana: 'くるしみ', kanji: '苦しみ', meaning_vi: 'Nỗi đau, Sự đau khổ' },
  { kana: 'けいい', kanji: '敬意', meaning_vi: 'Sự kính trọng' },
  { kana: 'けっさく', kanji: '傑作', meaning_vi: 'Kiệt tác' },
  { kana: 'けんぎょう', kanji: '兼業', meaning_vi: 'Làm thêm, Kiêm nhiệm' },
  { kana: 'こうじょ', kanji: '控除', meaning_vi: 'Khấu trừ, Giảm trừ' },
  { kana: 'こがす', kanji: '焦がす', meaning_vi: 'Làm cháy, Đốt cháy' },
  { kana: 'こくさい', kanji: '国債', meaning_vi: 'Trái phiếu chính phủ, Công trái' },
  { kana: 'ごまかす', meaning_vi: 'Lừa dối, Gian lận, Lấp liếm' },
  { kana: 'こりる', kanji: '懲りる', meaning_vi: 'Rút kinh nghiệm (từ thất bại)' },
  { kana: 'こんきょ', kanji: '根拠', meaning_vi: 'Căn cứ, Cơ sở' },
  { kana: 'さいばん', kanji: '裁判', meaning_vi: 'Phiên tòa, Xét xử' },
  { kana: 'さべつ', kanji: '差別', meaning_vi: 'Phân biệt đối xử' },
  { kana: 'さんじ', kanji: '惨事', meaning_vi: 'Thảm họa, Tai ương' },
  { kana: 'しいる', kanji: '強いる', meaning_vi: 'Ép buộc, Cưỡng bách' },
  { kana: 'しおれる', kanji: '萎れる', meaning_vi: 'Tàn héo, Ủ rũ (hoa, người)' },
  { kana: 'ししゃ', kanji: '支社', meaning_vi: 'Chi nhánh (công ty)' },
  { kana: 'したたか', kanji: '強か', meaning_vi: 'Cứng cỏi, Ngoan cường, Lì lợm' },
  { kana: 'しっと', kanji: '嫉妬', meaning_vi: 'Ghen tị, Đố kỵ' },
  { kana: 'しぶつ', kanji: '私物', meaning_vi: 'Đồ dùng cá nhân, Vật tư' },
  { kana: 'しゅうしゅう', kanji: '収拾', meaning_vi: 'Kiểm soát tình hình, Vãn hồi trật tự' },
  { kana: 'しゅうよう', kanji: '収容', meaning_vi: 'Chứa, Tiếp nhận (người, bệnh nhân)' },
  { kana: 'しゅし', kanji: '趣旨', meaning_vi: 'Mục đích, Tinh thần, Ý chính' },
  { kana: 'しゅんかん', kanji: '瞬間', meaning_vi: 'Khoảnh khắc' },
  { kana: 'しょうしん', kanji: '昇進', meaning_vi: 'Thăng chức, Thăng tiến' },
  { kana: 'しんぱん', kanji: '審判', meaning_vi: 'Trọng tài, Xét xử, Phán quyết' },
];

function main() {
  const dbPath = path.join(path.resolve(__dirname, '..'), 'data', 'dictionary.db');
  console.log(`Adding N1 words: ${WORDS.length}...`);
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
