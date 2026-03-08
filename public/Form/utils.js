import { i18n } from './i18n.js';

export const utils = {
  /** 10分刻みの時間セレクター生成 */
  createTimeSelectorHTML(prefix) {
    let h = `<select name="${prefix}_h" class="lz-time-select"><option value="">${i18n.misc.hour}</option>`;
    for (let i = 0; i < 24; i++) h += `<option value="${String(i).padStart(2, '0')}">${i}</option>`;
    h += `</select><span>:</span><select name="${prefix}_m" class="lz-time-select"><option value="">${i18n.misc.minute}</option>`;
    for (let i = 0; i < 60; i += 10) h += `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`;
    return h + `</select>`;
  },

  /** 郵便番号API検索 */
  async fetchAddress(zip) {
    const cleanZip = zip.replace(/-/, '');
    if (cleanZip.length !== 7) throw new Error(i18n.ui.alerts.zip_invalid);
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
    const data = await res.json();
    if (!data.results) throw new Error(i18n.ui.alerts.address_not_found);
    return data.results[0].address1 + data.results[0].address2 + data.results[0].address3;
  }
};