// 出発前ガイド v0.1 の文面（英語・日本語）
// IDは確認シートと1対1で対応する。［店が記入］の部分は、店ごとに差し替える。
// 架空の店「Sample Rent-a-Car（サンプルレンタカー）」用の試作。数字はすべて差し替え欄。

window.GUIDE = {
  version: 'v0.2',
  // 対応言語（沖縄で外国人のレンタカー利用が多い国・地域の言語。2026-11-14の調査より）
  // 台湾・香港＝繁體中文、韓国＝한국어、中国本土＝简体中文、そのほか＝English
  // 2026-11-14：元職場の客層（中国本土の客は来ず、台湾・韓国・香港・欧米・タイなど）に合わせて简体中文はメニューから外した。
  //   翻訳ファイル i18n/zh-Hans.js は残してあるので、下の行のコメントを外せばすぐ戻せる
  langs: [
    { code: 'en', label: 'English' },
    { code: 'zh-Hant', label: '繁體中文' },
    { code: 'ko', label: '한국어' },
    { code: 'th', label: 'ไทย' },
    // { code: 'zh-Hans', label: '简体中文' },
    { code: 'ja', label: '日本語' },
  ],
  // AIで翻訳し、ネイティブの確認がまだの言語（画面に注意書きを出す）
  draftLangs: ['zh-Hant', 'ko', 'th', 'zh-Hans'],
  shop: { en: 'Sample Rent-a-Car', ja: 'サンプルレンタカー' },
  ui: {
    tabs: { return: { en: 'Return', ja: '返却' }, insurance: { en: 'Insurance', ja: '保険・NOC' }, car: { en: 'Controls', ja: '操作' }, check: { en: 'Check ✓', ja: '確認 ✓' } },
    exampleOnly: { en: 'Example only', ja: 'あくまで一例です' },
    unfilled: { en: 'Some shop details are not filled in yet.', ja: '店が記入していない項目があります。' },
    showEnglish: { en: 'Show English', ja: '英語を見る' },
  },
  pages: {
    return: [
      { id: 'A-00', t: 'h1', en: 'Returning your car', ja: '車の返却について' },
      { id: 'A-01', t: 'lead', en: 'Please read this before your last day. It helps you return the car on time and avoid extra fees.', ja: '返却日の前に読んでください。時間どおりに返却し、追加料金を避けるための案内です。' },
      { id: 'A-02', t: 'summary', items: [
        { icon: 'clock', jump: 'A-10', en: 'Return the car by the time on your booking.', ja: '予約の返却時間までに返してください。' },
        { icon: 'fuel', jump: 'A-20', en: 'Fill the tank near our shop. Keep the receipt.', ja: '店の近くで満タンにし、レシートを持ってきてください。' },
        { icon: 'camera', jump: 'A-50', en: 'Our staff will check the car with you.', ja: 'スタッフがお客様と一緒に車を確認します。' },
      ] },

      { id: 'A-10', t: 'h2', icon: 'clock', en: 'Return time', ja: '返却時間' },
      { id: 'A-11', t: 'li', en: 'Please return the car by the time on your booking.', ja: '予約時に決めた返却時間までに、車を返却してください。' },
      { id: 'A-12', t: 'li', en: 'Shop hours: [Shop sets: __:__ – __:__]', ja: '営業時間：［店が記入：__:__〜__:__］' },
      { id: 'A-13', t: 'li', en: 'Will you be late? Please contact us before your return time.', ja: '遅れそうなときは、返却時間の前に店へ連絡してください。' },
      { id: 'A-14', t: 'li', important: true, en: 'Late return fee: [Shop sets: ¥__ for each __ hour(s)]', ja: '延長料金：［店が記入：__時間ごとに__円］' },
      { id: 'A-15', t: 'li', en: 'After shop hours: [Shop sets: what guests should do]', ja: '営業時間外の返却：［店が記入：お客様にしてほしいこと］' },
      { id: 'A-16', t: 'button', icon: 'phone', href: 'tel:', en: 'Call the shop', ja: '店に電話する' },
      { id: 'A-17', t: 'button', icon: 'message', href: '#', secondary: true, en: 'Send a message ([Shop sets: LINE / WhatsApp / email])', ja: 'メッセージを送る（［店が記入：連絡手段］）' },

      { id: 'A-20', t: 'h2', icon: 'fuel', en: 'Fill the tank before you return', ja: '満タンにして返却' },
      { id: 'A-21', t: 'li', en: 'Please return the car with a full tank of fuel.', ja: 'ガソリンを満タンにして返却してください。' },
      { id: 'A-22', t: 'li', important: true, en: 'Please fill the tank within [Shop sets: __ km] of the return place.', ja: '返却場所から［店が記入：__km］以内のガソリンスタンドで給油してください。' },
      { id: 'A-23', t: 'li', en: 'Please show the fuel receipt to our staff.', ja: '給油のレシートをスタッフに見せてください。' },
      { id: 'A-24', t: 'li', important: true, en: 'If the tank is not full, or you have no receipt, we charge a fuel fee: [Shop sets: how it is calculated].', ja: '満タンでない場合、またはレシートがない場合は、燃料代を請求します：［店が記入：計算方法］。' },
      { id: 'A-25', t: 'tip', en: 'At the gas station', ja: 'ガソリンスタンドで', lines: [
        { id: 'A-26', en: 'Fuel for your car: [Shop sets: Regular]', ja: 'この車の燃料：［店が記入：レギュラー］' },
        { id: 'A-27', en: 'You can say: "Regular, mantan, please." (Mantan = full tank)', ja: '「レギュラー満タンでお願いします」と伝えてください。' },
        { id: 'A-28', en: 'At many stations in Japan, the regular fuel nozzle is red. Please check the label before you fill.', ja: '日本の多くのスタンドでは、レギュラーのノズルは赤色です。給油の前に表示を確認してください。' },
      ] },

      { id: 'A-30', t: 'h2', icon: 'pin', en: 'Gas stations near the return place', ja: '返却場所の近くのガソリンスタンド' },
      { id: 'A-31', t: 'station', en: '[Shop sets: station name]|[Shop sets: __ km] from the return place|Open: [Shop sets: hours]|[Shop sets: Self-service or Staff service]', ja: '［店が記入：スタンド名］|返却場所から［店が記入：__km］|営業時間：［店が記入］|［店が記入：セルフ・フルサービス］' },
      { id: 'A-31b', t: 'station', en: '[Shop sets: station name]|[Shop sets: __ km] from the return place|Open: [Shop sets: hours]|[Shop sets: Self-service or Staff service]', ja: '［店が記入：スタンド名］|返却場所から［店が記入：__km］|営業時間：［店が記入］|［店が記入：セルフ・フルサービス］' },
      { id: 'A-33', t: 'note', en: 'Opening hours can change. Please check the map.', ja: '営業時間は変わることがあります。地図で確認してください。' },

      { id: 'A-40', t: 'h2', icon: 'pin', en: 'How to get to the return place', ja: '返却場所への行き方' },
      { id: 'A-41', t: 'li', en: 'Address: [Shop sets]', ja: '住所：［店が記入］' },
      { id: 'A-42', t: 'button', icon: 'pin', href: '#', secondary: true, en: 'Open in Google Maps', ja: 'Googleマップで開く' },
      { id: 'A-43', t: 'li', en: 'Car navigation: you can search by our phone number, [Shop sets: number].', ja: 'カーナビでは、店の電話番号［店が記入］で検索できます。' },
      { id: 'A-44', t: 'li', en: 'Step 1–3: [Shop sets: photo + one short sentence]', ja: 'ステップ1〜3：［店が記入：写真と短い説明1文］' },
      { id: 'A-45', t: 'li', en: 'Please leave extra time for fuel and traffic.', ja: '給油と渋滞の分、時間に余裕をもって出発してください。' },
      { id: 'A-46', t: 'li', en: 'After the return, we take you to [Shop sets: airport / place] by shuttle. It takes about [Shop sets: __ minutes].', ja: '返却後は、［店が記入：空港など］まで送迎します。所要時間は約［店が記入：__分］です。' },

      { id: 'A-50', t: 'h2', icon: 'camera', en: 'Checking the car together', ja: '返却時の車の確認' },
      { id: 'A-5x', t: 'carphotos' },
      { id: 'A-51', t: 'li', en: 'At pickup, you took 4 photos of the car: front, back, left and right.', ja: '貸出のとき、車を前・後ろ・左・右の4方向から撮影していただきました。' },
      { id: 'A-52', t: 'li', en: 'At return, our staff will check the car with you.', ja: '返却時は、スタッフがお客様と一緒に車を確認します。' },
      { id: 'A-53', t: 'li', en: 'Please keep your pickup photos on your phone until the check is done.', ja: '確認が終わるまで、貸出時の写真をスマホに残しておいてください。' },
      { id: 'A-54', t: 'li', en: 'You can also take 4 photos again before you return the key. This helps both you and us.', ja: '鍵を返す前に、もう一度4方向の写真を撮っておくと、お客様と店の両方にとって安心です。' },
      { id: 'A-55', t: 'li', en: 'Found a new scratch or dent? Please tell our staff. Do not try to fix it yourself.', ja: '新しい傷やへこみに気づいたら、スタッフに伝えてください。ご自分で直そうとしないでください。' },
      { id: 'A-56', t: 'li', link: 'insurance', en: 'If you have an accident, call the police and us right away. Do not wait until you return. → Insurance & NOC', ja: '事故があったときは、返却時ではなく、その場ですぐ警察と店に連絡してください。→ 保険・NOC' },

      { id: 'A-60', t: 'h2', icon: 'check', en: 'Before you leave the car', ja: '車を降りる前に' },
      { id: 'A-61', t: 'li', en: 'Check for your things: phone, charger, sunglasses, bags.', ja: '忘れ物はありませんか：スマホ、充電器、サングラス、バッグ。' },
      { id: 'A-62', t: 'li', en: 'ETC card (for toll roads): [Shop sets: leave it in the car / give it to staff]. Toll fees are paid [Shop sets: at return / other].', ja: 'ETCカード（高速道路の料金カード）：［店が記入：車内に残す／スタッフに渡す］。高速料金は［店が記入：返却時に精算 など］。' },

      { id: 'A-91', t: 'footer', en: 'This is a summary. The rental agreement (Japanese) takes priority.', ja: 'これは要約です。正式な内容は日本語の貸渡約款が優先されます。' },
      { id: 'A-92', t: 'footnote', en: 'Last checked by the shop: [Shop sets: date]', ja: '店が最後に確認した日：［店が記入：日付］' },
      { id: 'A-93', t: 'footnote', en: 'Rental agreement (Japanese): [Shop sets: link]', ja: '貸渡約款（日本語）：［店が記入：リンク］' },
      { id: 'A-94', t: 'nav', to: 'insurance', en: 'Next: Insurance & NOC →', ja: '次へ：保険・NOC →' },
    ],

    insurance: [
      { id: 'B-00', t: 'h1', en: 'Insurance and NOC', ja: '保険・免責補償・NOC' },
      { id: 'B-01', t: 'lead', en: 'This page explains what you may pay if there is an accident or damage. Please read it before you drive.', ja: '事故や車の損傷があったとき、お客様が何を支払う可能性があるかの説明です。運転の前に読んでください。' },
      { id: 'B-02', t: 'summary', important: true, items: [
        { icon: 'shield', jump: 'B-10', en: 'Your rental includes basic insurance. But you may still pay some costs.', ja: '料金には基本補償が含まれています。ただし、一部の費用はお客様の負担になることがあります。' },
        { icon: 'plus', jump: 'B-30', en: 'CDW is an extra cover. It can lower what you pay.', ja: '免責補償（CDW）に加入すると、お客様の負担を減らせます。' },
        { icon: 'alert', jump: 'B-70', en: 'If there is an accident, always call the police and us.', ja: '事故のときは、必ず警察と店に連絡してください。' },
      ] },

      { id: 'B-10', t: 'h2', icon: 'shield', en: 'What basic insurance covers', ja: '基本補償の内容' },
      { id: 'B-11', t: 'table', important: true, head: { en: ['Cover', 'Up to'], ja: ['補償の種類', '上限'] }, rows: [
        { en: ['Injury to other people', '[Shop sets]'], ja: ['対人補償', '［店が記入］'] },
        { en: ["Damage to other people's things", '[Shop sets]'], ja: ['対物補償', '［店が記入］'] },
        { en: ['Damage to the rental car', '[Shop sets]'], ja: ['車両補償', '［店が記入］'] },
        { en: ['Injury to people in your car', '[Shop sets]'], ja: ['人身傷害補償', '［店が記入］'] },
      ] },
      { id: 'B-12', t: 'li', important: true, en: 'A "deductible" is the part you pay yourself, even with insurance.', ja: '「免責額」とは、保険を使っても、お客様が自分で支払う金額のことです。' },
      { id: 'B-13', t: 'li', important: true, en: "Your deductible: Damage to other people's things [Shop sets: ¥__] / Damage to the rental car [Shop sets: ¥__]", ja: '免責額：対物［店が記入：__円］／車両［店が記入：__円］' },

      { id: 'B-20', t: 'h2', icon: 'x', en: 'Not covered by insurance (examples)', ja: '補償の対象外になる例' },
      { id: 'B-21', t: 'xli', important: true, optional: true, en: 'Driving after drinking alcohol', ja: '飲酒運転' },
      { id: 'B-22', t: 'xli', important: true, optional: true, en: 'An accident you did not report to the police', ja: '警察に届け出なかった事故' },
      { id: 'B-23', t: 'xli', important: true, optional: true, en: 'A driver who is not on the rental agreement', ja: '契約書に記載されていない人の運転' },
      { id: 'B-24', t: 'xli', important: true, optional: true, en: 'Driving without a valid license', ja: '有効な免許を持たない運転' },
      { id: 'B-25', t: 'xli', important: true, optional: true, en: 'Parking tickets and traffic fines', ja: '駐車違反・交通違反の反則金など' },
      { id: 'B-26', t: 'xli', important: true, optional: true, en: '[Shop sets: e.g. tire damage, lost keys, smoking in the car]', ja: '［店が記入：例 タイヤの損傷、鍵の紛失、車内での喫煙］' },
      { id: 'B-27', t: 'note', en: 'Please see the rental agreement for the full list.', ja: 'すべての項目は貸渡約款をご確認ください。' },

      { id: 'B-30', t: 'h2', icon: 'plus', en: 'What is CDW?', ja: '免責補償（CDW）とは' },
      { id: 'B-31', t: 'li', en: 'CDW means Collision Damage Waiver.', ja: 'CDWは、免責補償制度のことです。' },
      { id: 'B-32', t: 'li', important: true, en: 'With CDW, you do not pay the deductible in most cases. The cases above (not covered) are not included.', ja: '加入すると、多くの場合、免責額をお客様が支払う必要がなくなります。上の「対象外になる例」は除きます。' },
      { id: 'B-33', t: 'li', important: true, en: 'Price: [Shop sets: ¥__ per day]. [Shop sets: Optional / Included in your plan]', ja: '料金：［店が記入：1日__円］。［店が記入：任意加入／プランに含まれる］' },
      { id: 'B-34', t: 'li', important: true, en: 'CDW does not cover NOC.', ja: '免責補償に加入しても、NOCは補償されません。' },

      { id: 'B-40', t: 'h2', icon: 'doc', en: 'What is NOC?', ja: 'NOC（ノンオペレーションチャージ）とは' },
      { id: 'B-41', t: 'li', en: 'NOC means Non-Operation Charge.', ja: 'NOCは「休業補償」のことです。' },
      { id: 'B-42', t: 'li', en: 'When a car is damaged, we cannot rent it while it is repaired or cleaned. NOC pays for part of this lost time.', ja: '事故や汚損で車を修理・清掃する間、その車は貸し出せません。その間の営業損失の一部をお客様にご負担いただくものです。' },
      { id: 'B-43', t: 'li', important: true, en: 'You pay NOC even if you have insurance or CDW.', ja: '保険や免責補償に加入していても、NOCはお客様の負担です。' },
      { id: 'B-44', t: 'table', important: true, head: { en: ['Case', 'NOC'], ja: ['場合', 'NOC'] }, rows: [
        { en: ['You can drive the car back to the shop', '[Shop sets: ¥__]'], ja: ['自走して店に戻れる場合', '［店が記入：__円］'] },
        { en: ['The car cannot be driven back', '[Shop sets: ¥__]'], ja: ['自走できない場合', '［店が記入：__円］'] },
      ] },
      { id: 'B-45', t: 'li', important: true, en: 'NOC cover: [Shop sets: name, ¥__ per day / "We do not offer this."]', ja: 'NOC補償：［店が記入：名称・1日__円／取り扱いなし］' },

      { id: 'B-50', t: 'h2', icon: 'plus', en: 'Extra cover options', ja: '追加の補償オプション' },
      { id: 'B-51', t: 'table', head: { en: ['Name', 'Price per day', 'What it covers'], ja: ['名称', '1日の料金', '補償の範囲'] }, rows: [
        { en: ['[Shop sets]', '[Shop sets]', '[Shop sets]'], ja: ['［店が記入］', '［店が記入］', '［店が記入］'] },
      ] },
      { id: 'B-52', t: 'li', important: true, en: 'These options are [Shop sets: optional / required]. You can choose [Shop sets: when you book / at the counter].', ja: 'これらのオプションは［店が記入：任意／必須］です。［店が記入：予約時／カウンター］で選べます。' },

      { id: 'B-60', t: 'example', en: 'Example only: what you might pay', ja: '例（あくまで一例です）：お客様の負担額', lines: [
        { id: 'B-61', en: 'You hit a wall. The car can still be driven back to the shop.', ja: '壁にぶつけた。車は自走して店に戻れる。' },
        { id: 'B-62a', en: 'No CDW: deductible [Shop sets: ¥__] + NOC [Shop sets: ¥__]', ja: '免責補償なし：免責額［店が記入］＋NOC［店が記入］' },
        { id: 'B-62b', en: 'With CDW: NOC [Shop sets: ¥__]', ja: '免責補償あり：NOC［店が記入］' },
        { id: 'B-62c', en: 'With CDW + NOC cover: [Shop sets: ¥__]', ja: '免責補償＋NOC補償あり：［店が記入］' },
        { id: 'B-63', en: 'Real costs depend on the accident and the rental agreement.', ja: '実際の金額は、事故の内容と貸渡約款によって変わります。' },
      ] },

      { id: 'B-70', t: 'accident', en: 'If there is an accident', ja: '事故が起きたら', lines: [
        { id: 'B-71', en: '1. Stop in a safe place. If someone is hurt, call 119 for an ambulance.', ja: '1. 安全な場所に止めてください。けが人がいれば119番で救急車を呼んでください。' },
        { id: 'B-72', en: '2. Call the police: 110. You must report every accident, even a small one.', ja: '2. 110番で警察に連絡してください。小さな事故でも届け出が必要です。' },
        { id: 'B-73', en: '3. Call us: [Shop sets: phone number].', ja: '3. 店に連絡してください：［店が記入：電話番号］' },
        { id: 'B-74', en: '4. Do not make a private deal with the other driver.', ja: '4. 相手とその場で示談しないでください。' },
        { id: 'B-75', en: '5. Take photos of the place and the cars.', ja: '5. 現場と車の写真を撮ってください。' },
        { id: 'B-76', important: true, en: 'If you do not report to the police, insurance may not pay.', ja: '警察に届け出ないと、保険が使えないことがあります。' },
        { id: 'B-77', important: true, en: 'Our staff can help you talk with the police by phone. [Shop sets: yes / no]', ja: '警察とのやり取りを、スタッフが電話でお手伝いします。［店が記入：する／しない］' },
      ], buttons: [
        { href: 'tel:110', en: 'Call 110 Police', ja: '110 警察' },
        { href: 'tel:119', en: 'Call 119 Ambulance', ja: '119 救急' },
        { href: 'tel:', en: 'Call the shop', ja: '店に電話' },
      ] },

      { id: 'B-91', t: 'footer', en: 'This is a summary. The rental agreement (Japanese) takes priority.', ja: 'これは要約です。正式な内容は日本語の貸渡約款が優先されます。' },
      { id: 'B-92', t: 'footnote', en: 'Last checked by the shop: [Shop sets: date]', ja: '店が最後に確認した日：［店が記入：日付］' },
      { id: 'B-93', t: 'footnote', en: 'Rental agreement (Japanese): [Shop sets: link]', ja: '貸渡約款（日本語）：［店が記入：リンク］' },
      { id: 'B-94', t: 'nav', to: 'return', en: '← Back: Return rules', ja: '← 戻る：返却ルール' },
    ],
  },
};

// 出発前の「理解しました」確認ページ（2026-11-14 追加）
// お客さんが母国語で読み、項目ごとに「理解しました」を押す。結果はサーバーに保存せず、
// 完了画面をスタッフに見せる（A）か、お客さん自身がLINE等で店に送る（B）。
window.GUIDE.pages.check = [
  { id: 'C-00', t: 'h1', en: 'Before you drive: please confirm', ja: '出発前の確認' },
  { id: 'C-01', t: 'lead', en: 'Please read each point in your language and tap "I understand". When you finish, show the last screen to our staff.', ja: '各項目をお客様の言語で読み、「理解しました」を押してください。最後の画面をスタッフに見せてください。' },
  { id: 'C-02', t: 'booking', en: 'Your name (so our staff can check)', ja: 'お名前（スタッフが確認するため）' },
  { id: 'C-10', t: 'citem', link: 'return', title: { en: 'Return time', ja: '返却時間' }, en: 'Return the car by the time on your booking. If you will be late, contact us before that time. A late return fee may apply.', ja: '予約の返却時間までに返却します。遅れるときは、その前に店へ連絡します。延長料金がかかることがあります。' },
  { id: 'C-20', t: 'citem', link: 'return', title: { en: 'Full tank', ja: '満タン返し' }, en: 'Return the car with a full tank, filled near our shop. Show the fuel receipt. Otherwise, we charge a fuel fee.', ja: '店の近くで満タンにして返却し、給油のレシートを見せます。そうでない場合は燃料代がかかります。' },
  { id: 'C-30', t: 'citem', link: 'return', title: { en: 'Car check and photos', ja: '車の確認と写真' }, en: 'Take 4 photos of the car now (front, back, left, right). At return, our staff will check the car with you.', ja: '今、車を4方向（前・後ろ・左・右）から撮影します。返却時にスタッフと一緒に車を確認します。' },
  { id: 'C-40', t: 'citem', link: 'insurance', title: { en: 'Insurance and deductible', ja: '保険と免責額' }, en: 'Basic insurance is included, but you may still pay a deductible if there is damage. CDW can lower this.', ja: '基本補償は含まれていますが、損傷があると免責額を負担することがあります。免責補償（CDW）で減らせます。' },
  { id: 'C-50', t: 'citem', link: 'insurance', title: { en: 'NOC', ja: 'NOC（休業補償）' }, en: 'If the car is damaged, you pay NOC (Non-Operation Charge), even with insurance or CDW.', ja: '車が損傷した場合、保険や免責補償に入っていても、NOC（休業補償）を負担します。' },
  { id: 'C-60', t: 'citem', link: 'insurance', title: { en: 'If there is an accident', ja: '事故のとき' }, en: 'Call the police (110) and our shop right away, even for a small accident. If you do not report it, insurance may not pay.', ja: '小さな事故でも、すぐに警察（110）と店に連絡します。届け出ないと保険が使えないことがあります。' },
  { id: 'C-90', t: 'note', en: 'This checks your understanding. It is not a signature or an agreement. The rental agreement (Japanese) takes priority.', ja: 'これは理解の確認です。署名や同意の代わりではありません。正式な内容は日本語の貸渡約款が優先されます。' },
];

// 車の操作説明ページ（2026-11-14 追加）
// 図の番号をタップすると説明が出る。いまは見本のイラスト。店が実車の写真に差し替えるときは
// photo に画像ファイル名を入れ、各番号の x・y（写真の左上からの位置％）を写真に合わせて直す。
window.GUIDE.pages.car = [
  { id: 'D-00', t: 'h1', en: 'Car controls', ja: '車の操作' },
  { id: 'D-01', t: 'lead', en: 'Tap a number on the picture to see what it does.', ja: '図の番号をタップすると、説明が出ます。' },
  { id: 'D-10', t: 'hotspots', photo: '', items: [
    { x: 92.5, y: 57.7, title: { en: 'Turn signal', ja: 'ウインカー' }, en: 'The turn signal is the lever on the RIGHT side of the steering wheel.', ja: 'ウインカーは、ハンドルの右側のレバーです。' },
    { x: 49, y: 52, title: { en: 'Wipers', ja: 'ワイパー' }, en: 'The wipers are the lever on the LEFT side. In many Japanese cars, the turn signal and wipers are on the opposite side from cars in many other countries. If the wipers start when you want to turn, you used the wrong lever.', ja: 'ワイパーは、ハンドルの左側のレバーです。日本の車の多くは、ほかの多くの国の車とウインカーとワイパーが左右逆です。曲がるつもりでワイパーが動いたら、レバーの間違いです。' },
    { x: 91, y: 41, title: { en: 'Headlights', ja: 'ライト' }, en: 'Turn the end of the right lever to turn on the lights. [Shop sets: AUTO setting of this car]', ja: '右側のレバーの先を回して、ライトを点けます。［店が記入：この車のAUTOの設定］' },
    { x: 87.5, y: 77, title: { en: 'Start the engine', ja: 'エンジンをかける' }, en: '[Shop sets: how to start this car, e.g. press the brake pedal and push the POWER button]', ja: '［店が記入：この車の始動方法。例：ブレーキを踏みながらPOWERボタンを押す］' },
    { x: 35, y: 57, title: { en: 'Hazard lights', ja: 'ハザードランプ' }, en: 'The button with a red triangle turns on the hazard lights. Use it when you must stop in an emergency.', ja: '赤い三角のボタンで、ハザードランプが点きます。緊急で止まるときに使います。' },
    { x: 37.5, y: 79, title: { en: 'Shift lever', ja: 'シフトレバー' }, en: 'P = Park, R = Reverse, N = Neutral, D = Drive. [Shop sets: other positions of this car, e.g. B]', ja: 'P＝駐車、R＝後退、N＝ニュートラル、D＝走行。［店が記入：この車のほかの位置。例：B］' },
    { x: 27.5, y: 89, title: { en: 'Parking brake', ja: 'パーキングブレーキ' }, en: 'Type: [Shop sets: foot pedal / button / lever]. Release it before you drive.', ja: '種類：［店が記入：足踏み式／ボタン式／レバー式］。走る前に解除します。' },
    { x: 93, y: 90, title: { en: 'Fuel door', ja: '給油口' }, en: 'Fuel door opener: [Shop sets: place]. On the fuel gauge, the small arrow next to the pump icon shows which side the fuel door is on.', ja: '給油口を開けるレバー：［店が記入：場所］。燃料計の給油マークの横にある小さな矢印が、給油口のある側を示します。' },
    { x: 62.5, y: 92, title: { en: 'ETC card (expressway toll)', ja: 'ETCカード（高速道路の料金）' }, en: 'ETC card slot: [Shop sets: place]. Insert the card before you enter the expressway.', ja: 'ETCカードの差し込み口：［店が記入：場所］。高速道路に入る前に差し込みます。' },
  ] },
  { id: 'D-90', t: 'note', en: 'This is a sample picture. The shop will replace it with a photo of your car. The place of each control can differ by car model.', ja: 'これは見本の図です。店が実際の車の写真に差し替えます。車種によって位置が違うことがあります。' },
];

// 画面の小さな文言（言語ごと）。翻訳ファイルで言語を足すときは、ここにも同じキーを入れる
window.GUIDE_LTEXT = {
  en: { front: '① Front', back: '② Back', left: '③ Left', right: '④ Right', photos4: 'Take 4 photos of the car', maps: 'Open in Google Maps',
        draft: 'This translation was made with AI and has not been checked by a native speaker yet.',
        understand: 'I understand', understood: 'Understood ✓', more: 'Read more', remain: 'Items left to confirm: ',
        doneTitle: 'Confirmed', doneLead: 'Please show this screen to our staff.', share: 'Send to the shop (LINE, etc.)', copied: 'Copied. Please paste it into your message to the shop.',
        time: 'Time', language: 'Language', booking: 'Name', again: 'Start over',
        sample: 'Sample picture', tapnum: 'Tap a number' },
  ja: { front: '① 前', back: '② 後ろ', left: '③ 左', right: '④ 右', photos4: '車を4方向から撮影', maps: 'Googleマップで開く',
        draft: 'この翻訳はAIで作成したもので、ネイティブの確認はまだです。',
        understand: '理解しました', understood: '理解しました ✓', more: 'くわしく読む', remain: '残りの確認：',
        doneTitle: '確認完了', doneLead: 'この画面をスタッフに見せてください。', share: '店に送る（LINEなど）', copied: 'コピーしました。店へのメッセージに貼り付けてください。',
        time: '日時', language: '言語', booking: 'お名前', again: '最初からやり直す',
        sample: '見本の図', tapnum: '番号をタップしてください' },
};
