// 出発前ガイド v0.1 の文面（英語・日本語）
// IDは確認シートと1対1で対応する。［店が記入］の部分は、店ごとに差し替える。
// 架空の店「Sample Rent-a-Car（サンプルレンタカー）」用の試作。数字はすべて差し替え欄。

window.GUIDE = {
  version: 'v0.1',
  shop: { en: 'Sample Rent-a-Car', ja: 'サンプルレンタカー' },
  ui: {
    tabs: { return: { en: 'Return', ja: '返却' }, insurance: { en: 'Insurance', ja: '保険・NOC' } },
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
