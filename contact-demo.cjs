// Static portfolio UI only. No endpoint, account, or delivery service is configured.
module.exports = `<section class="detail-block" aria-labelledby="phone-title"><p class="eyebrow">BY PHONE</p><h2 id="phone-title">お電話でのご相談</h2><a class="demo-phone" href="tel:00000000000">000-0000-0000</a><p class="section-note">ポートフォリオ用のダミー番号です。タップすると端末の電話アプリへ進みますが、実際のお問い合わせはできません。</p></section>
<section class="detail-block" aria-labelledby="form-title"><p class="eyebrow">WEB INQUIRY</p><h2 id="form-title">Webからのご相談</h2><p id="demo-form-note" class="section-note">こちらはポートフォリオ用のデモフォームです。入力内容は送信・保存されません。実際の個人情報は入力しないでください。</p>
<form class="demo-form" id="demo-contact" aria-describedby="demo-form-note" autocomplete="off">
<fieldset disabled id="demo-fields"><legend>お問い合わせ内容 <span>＊は必須項目です</span></legend>
<div class="form-field"><label for="inquiry-kind">ご相談の種類 <span>＊</span></label><select id="inquiry-kind" required><option value="">選択してください</option><option>建築工事</option><option>改修・リノベーション</option><option>土木・外構工事</option><option>採用について</option><option>その他</option></select></div>
<div class="form-row"><div class="form-field"><label for="inquiry-name">お名前 <span>＊</span></label><input id="inquiry-name" type="text" maxlength="80" required placeholder="例：架空 太郎"></div><div class="form-field"><label for="inquiry-company">会社名 <small>任意</small></label><input id="inquiry-company" type="text" maxlength="120" placeholder="例：架空建設株式会社"></div></div>
<div class="form-field"><label for="inquiry-email">メールアドレス <span>＊</span></label><input id="inquiry-email" type="email" maxlength="254" required placeholder="contact@example.com" inputmode="email"></div>
<div class="form-field"><label for="inquiry-message">ご相談内容 <span>＊</span></label><textarea id="inquiry-message" rows="6" maxlength="3000" required placeholder="ご相談の概要や、ご希望の時期などをご入力ください。"></textarea></div>
<label class="demo-consent"><input id="demo-consent" type="checkbox" required><span>デモフォームであり、入力内容が送信されないことを確認しました。</span></label>
<button class="button" type="button" id="demo-submit">入力内容を確認する <span aria-hidden="true">→</span></button>
</fieldset><noscript><p class="notice">フォームの操作にはJavaScriptが必要です。入力内容を送信する機能はありません。</p></noscript>
<p id="demo-result" role="status" aria-live="polite" tabindex="-1"></p></form></section>`;
