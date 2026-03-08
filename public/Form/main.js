import { formStyles } from './styles.js';
import { getFormHTML } from './templates.js'; // 🍎 変更
import { initFormLogic } from './logic.js';

(function() {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = formStyles;
  document.head.appendChild(styleTag);

  const target = document.getElementById('lz-form-container') || document.body;
  target.insertAdjacentHTML('beforeend', getFormHTML()); // 🍎 関数を実行して注入
  
  initFormLogic();
})();