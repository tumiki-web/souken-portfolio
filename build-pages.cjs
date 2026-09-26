// Dependency-free page assembly. Run `node build-pages.cjs` after editing shared markup.
const fs = require('node:fs');
const voidElements = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const blockElements = new Set([
  'html','head','body','header','nav','main','footer','section','article','div',
  'p','h1','h2','h3','h4','h5','h6','dl','dt','dd','form','fieldset','legend',
  'aside','details','summary','noscript','style'
]);

function formatHtml(html) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  const tokens = html.match(/<!--[\s\S]*?-->|<!doctype[^>]*>|<[^>]+>|[^<]+/gi) || [];

  for (const token of tokens) {
    const parent = stack[stack.length - 1];
    if (/^<!--|^<!doctype/i.test(token)) {
      parent.children.push({ type: 'raw', value: token });
      continue;
    }
    if (/^<\//.test(token)) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (/^</.test(token)) {
      const match = token.match(/^<\s*([^\s/>]+)/);
      if (!match) {
        parent.children.push({ type: 'raw', value: token });
        continue;
      }
      const name = match[1].toLowerCase();
      const node = { type: 'element', name, open: token, children: [] };
      parent.children.push(node);
      if (!voidElements.has(name) && !/\/>$/.test(token) && !/^<!/.test(token)) stack.push(node);
      continue;
    }
    if (token.trim()) parent.children.push({ type: 'text', value: token });
  }

  const inline = node => {
    if (node.type === 'text' || node.type === 'raw') return node.value;
    const children = node.children.map(inline).join('');
    return voidElements.has(node.name) ? node.open : `${node.open}${children}</${node.name}>`;
  };

  const render = (node, depth = 0) => {
    if (node.type === 'root') return node.children.flatMap(child => render(child, depth));
    if (node.type !== 'element' || !blockElements.has(node.name)) return [`${'  '.repeat(depth)}${inline(node)}`];

    const indent = '  '.repeat(depth);
    if (voidElements.has(node.name)) return [`${indent}${node.open}`];
    const structured = node.name === 'head' || node.name === 'nav' ||
      node.children.some(child => child.type === 'element' && blockElements.has(child.name));
    if (!structured) return [`${indent}${inline(node)}`];

    const lines = [`${indent}${node.open}`];
    let inlineRun = '';
    const flushInline = () => {
      if (!inlineRun) return;
      lines.push(`${'  '.repeat(depth + 1)}${inlineRun}`);
      inlineRun = '';
    };
    for (const child of node.children) {
      if (child.type === 'element' && blockElements.has(child.name)) {
        flushInline();
        lines.push(...render(child, depth + 1));
      } else if (node.name === 'head' || node.name === 'nav') {
        flushInline();
        lines.push(...render(child, depth + 1));
      } else {
        inlineRun += inline(child);
      }
    }
    flushInline();
    lines.push(`${indent}</${node.name}>`);
    return lines;
  };

  return `${render(root).join('\n')}\n`;
}
const nav = [['service','SERVICE','事業内容'],['works','WORKS','施工実績'],['company','COMPANY','会社案内'],['recruit','RECRUIT','採用情報']];
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const brand = '<img src="assets/images/favicon.svg" alt="" width="40" height="45"><span class="brand-name">株式会社 蒼建<span class="brand-en">SOKEN CONSTRUCTION</span></span>';
const link = (href,label,cls='text-link') => `<a class="${cls}" href="${href}">${label}${arrow}</a>`;
const media = (name,alt,label,cls='') => `<div class="media ${cls}" data-label="${label}"><img src="assets/images/${name.includes('.') ? name : name + '.jpg'}" alt="${alt}" width="1200" height="900" loading="lazy" decoding="async" data-optional></div>`;
function header(page){return `<a class="skip-link" href="#main">本文へスキップ</a><header class="site-header"><a class="brand" href="index.html" aria-label="株式会社 蒼建 ホーム">${brand}</a><nav class="desktop-nav" aria-label="メインナビゲーション">${nav.map(([id,en,ja])=>`<a href="${id}.html" ${page===id?'aria-current="page"':''}>${ja}</a>`).join('')}<a class="nav-contact" href="contact.html">お問い合わせ <span aria-hidden="true">↗</span></a></nav><button class="menu-toggle" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></header><nav class="mobile-nav" id="mobile-nav" aria-label="モバイルナビゲーション" hidden><a href="index.html">HOME<small>ホーム</small></a>${nav.map(([id,en,ja])=>`<a href="${id}.html" ${page===id?'aria-current="page"':''}>${en}<small>${ja}</small></a>`).join('')}<a class="mobile-contact" href="contact.html">お問い合わせ ${arrow}</a></nav>`;}
const contact = `<section class="contact-band"><div class="wrap contact-inner"><div><p class="eyebrow">CONTACT</p><h2>まだ、構想の段階でも。</h2><p>土地のこと、建物のこと。まずは、お話を聞かせてください。</p></div>${link('contact.html','事業・施工について相談する','button')}</div></section>`;
const footer = `<footer class="site-footer"><div class="wrap"><div class="footer-top"><div><a class="brand" href="index.html">${brand}</a><p class="footer-address">福岡県福岡市（架空）を拠点とする総合建設会社<br>建築工事 / 改修工事 / 土木工事</p></div><nav class="footer-nav" aria-label="フッターナビゲーション">${nav.map(([id,en,ja])=>`<a href="${id}.html">${ja}</a>`).join('')}<a href="contact.html">お問い合わせ</a><a href="#top">ページの先頭へ ↑</a></nav></div><div class="footer-bottom"><p>© SOKEN CONSTRUCTION</p><p class="portfolio-note">本サイトはTUMIKI Web.がポートフォリオとして制作した架空のWebサイトです。実在する企業・団体とは関係ありません。<br>企業情報・人物・施工実績・採用情報はすべて架空設定であり、同名・類似名の企業・団体・人物とは一切関係ありません。</p></div></div></footer>`;
function page(id,title,description,body){title = (id === 'index' ? '株式会社 蒼建' : title) + '｜建設会社Webサイト制作事例｜TUMIKI Web.'; description = 'TUMIKI Web.がポートフォリオとして制作した架空企業のWebサイトです。実在する同名・類似名の企業・団体・人物とは一切関係ありません。' + description; return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description" content="${description}">${id==='contact'?'<meta http-equiv="Content-Security-Policy" content="form-action &apos;none&apos;">':''}<meta name="theme-color" content="#16364b"><meta property="og:type" content="${id==='index'?'website':'article'}"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="TUMIKI Web.｜架空企業サイト制作事例"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><!-- 公開URLと画像確定後にcanonical・og:url・og:imageを追加 --><link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg"><link rel="stylesheet" href="assets/css/style.css"><script src="assets/js/main.js" defer></script><noscript><style>.menu-toggle{display:none}.mobile-nav[hidden]{display:block;position:static;padding-top:100px}.hero{min-height:760px}</style></noscript></head><body id="top">${header(id)}<main id="main">${body}</main>${footer}</body></html>`;}
const home = `<section class="hero" aria-labelledby="hero-title"><div class="hero-bg"><picture><source media="(max-width: 560px)" srcset="assets/images/hero-sp.webp" width="941" height="1672"><img src="assets/images/hero.webp" alt="建設現場で街の未来を見据える蒼建の若手社員" width="1672" height="941" fetchpriority="high" data-optional></picture></div><div class="hero-grid" aria-hidden="true"></div><div class="hero-content"><p class="hero-kicker">人と、街と、その先へ。</p><h1 id="hero-title">未来を、つくる。</h1><p class="hero-en">BUILD THE FUTURE.</p><p class="hero-lead">この街で暮らす、一人ひとりの明日へ。<br>私たちは、確かな技術とまっすぐな想いで、<br>福岡の未来を築いていきます。</p>${link('service.html','蒼建の仕事を知る')}</div><div class="hero-bottom"><a class="hero-scroll" href="#about">SCROLL TO DISCOVER</a><p class="hero-location">FUKUOKA, JAPAN — SINCE 2014</p><p class="hero-index">SOKEN<span></span>CONSTRUCTION</p></div></section>
<section class="section" id="about"><div class="wrap intro"><div><p class="eyebrow"><span>01</span>ABOUT US</p><h2 class="section-title">つくるのは、建物。<br>つないでいくのは、<br>街のこれから。</h2><p class="intro-sign">ROOTED IN FUKUOKA. BUILDING TOMORROW.</p></div><div class="intro-body"><p class="copy">住まいで過ごす、何気ない毎日。<br>新しいお店に、人が集まる瞬間。<br>働く場所から生まれる、次の挑戦。<br><br>建物の先には、いつも人の営みがあります。<br>株式会社 蒼建は、福岡を拠点とする総合建設会社。<br>一つひとつの声に耳を傾け、計画から施工、<br>その後の安心まで、誠実に向き合います。</p>${link('company.html','蒼建について')}</div></div></section>
<section class="section service" id="service"><div class="wrap"><div class="section-head"><div><p class="eyebrow"><span>02</span>OUR BUSINESS</p><h2 class="section-title">想いを、確かなかたちに。</h2></div>${link('service.html','事業内容を見る')}</div><div class="service-layout">${media('business.webp','自然光が差し込む、丁寧に施工された建物の内観','SPACE / DETAIL / QUALITY','service-visual media--photo')}<div><div class="service-list"><a href="service.html#architecture"><span class="item-no">01</span><div><h3>建築工事</h3><p>住まいから店舗、オフィス、地域の施設まで。<br>使う人の視点で、長く愛される建物を。</p></div>${arrow}</a><a href="service.html#renovation"><span class="item-no">02</span><div><h3>改修・リノベーション</h3><p>受け継いできた建物に、新しい価値を。<br>働き方や暮らしの変化に応える空間へ。</p></div>${arrow}</a><a href="service.html#civil"><span class="item-no">03</span><div><h3>土木・外構工事</h3><p>街を支える基盤から、身近な外まわりまで。<br>目に見えない安心も、丁寧につくります。</p></div>${arrow}</a></div><p class="section-note">計画のご相談から施工管理、お引き渡し後まで対応します。</p></div></div></div></section>
<section class="section strength"><div class="wrap"><div class="strength-top"><div><p class="eyebrow"><span>03</span>OUR STRENGTH</p><h2 class="section-title">まっすぐに<span class="strength-quality">向き合う。</span><br>その積み重ねが、<span class="strength-quality">品質。</span></h2></div><p class="copy">特別な一棟も、日々を支える工事も。<br>目の前の仕事に、できる限りの誠実さを。<br>蒼建が大切にしている、3つの約束です。</p></div><div class="strength-items"><article class="strength-item"><span class="strength-number">01</span><h3>対話から、はじめる。</h3><p>ご要望だけでなく、背景にある想いやお困りごとまで。予算と工程を共有し、納得できる計画を一緒に考えます。</p></article><article class="strength-item"><span class="strength-number">02</span><h3>見えないところまで。</h3><p>施工の確認と記録、安全への配慮を日々の基本に。完成後には見えなくなる部分こそ、手を抜かずに仕上げます。</p></article><article class="strength-item"><span class="strength-number">03</span><h3>この街で、末永く。</h3><p>お引き渡しは、新しいお付き合いの始まり。建物の変化や使い方の相談に、地域に根ざした距離感で応えます。</p></article></div></div></section>
<section class="section works" id="works"><div class="wrap"><div class="section-head"><div><p class="eyebrow"><span>04</span>SELECTED WORKS</p><h2 class="section-title">街に残る、私たちの仕事。</h2></div><p class="section-note">一つひとつの場所に、一つひとつの想い。</p></div><div class="works-grid"><a class="work" href="works.html#house">${media('works-house.webp','緑の庭と大きな開口部を備えた二階建て住宅の外観','01 / RESIDENCE','media--photo')}<div class="work-meta"><span>住宅 / 新築</span><span>福岡市西区 · 2025</span></div><h3>光と庭をつなぐ家${arrow}</h3></a><a class="work" href="works.html#shop">${media('works-bakery.webp','ガラス面と木材、植栽が調和するベーカリーの外観','02 / COMMERCIAL','media--photo')}<div class="work-meta"><span>店舗 / 改修</span><span>福岡市中央区 · 2025</span></div><h3>街角のベーカリー${arrow}</h3></a></div><div class="works-more">${link('works.html','施工実績を見る')}</div></div></section>
<section class="philosophy"><p class="eyebrow">OUR PHILOSOPHY</p><h2>いい仕事は、<br>いい未来につながっている。</h2><p>今日の丁寧な仕事が、誰かの明日の安心になる。<br>その実感を、私たちの誇りに。<br>人を育て、技術を磨き、地域とともに歩んでいきます。</p>${link('company.html#philosophy','私たちの想い')}</section>
<section class="section"><div class="wrap recruit">${media('recruit.webp','建設現場で図面を囲み、相談し合う若手社員と先輩社員','PEOPLE / TEAM / GROWTH','recruit-photo media--photo')}<div class="recruit-copy"><p class="eyebrow"><span>05</span>RECRUIT</p><h2 class="section-title">君の一歩が、<br>街の未来になる。</h2><p class="copy">最初から、できなくても大丈夫。<br>先輩と考え、現場で学び、少しずつ自分の技術にしていく。昨日よりできることが増える、その喜びを仲間と分かち合おう。</p>${link('recruit.html','蒼建で働く')}</div></div></section>${contact}`;
fs.writeFileSync('index.html',formatHtml(page('index','株式会社 蒼建｜未来を、つくる。','福岡を拠点に、建築・改修・土木工事を手がける株式会社 蒼建。確かな技術と誠実な対話で、人と街の未来をつくります。',home)));
function inner(id,en,ja,body){if(id==='service') return body; return `<section class="page-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="パンくず"><a href="index.html">HOME</a><span aria-hidden="true">/</span><span>${ja}</span></nav><p class="eyebrow">SOKEN CONSTRUCTION</p><h1>${en}</h1><p class="page-ja">${ja}</p></div></section><section class="section"><div class="wrap page-body">${body}</div></section>${id==='contact'?'':contact}`;}
const pages = {
 service:['SERVICE','事業内容','建築・改修・土木の3つの事業を通して、街と暮らしのこれからを支える株式会社 蒼建の事業内容。',`<section class="page-hero service-page-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="パンくず"><a href="index.html">HOME</a><span aria-hidden="true">/</span><span>事業内容</span></nav><div class="service-hero-layout"><div><p class="eyebrow">SOKEN CONSTRUCTION</p><h1>SERVICE</h1><p class="page-ja">事業内容</p></div><div class="service-hero-copy"><p class="service-hero-title"><span class="service-line">建てるだけではなく、</span><br>その先まで。</p><p>建物をつくること。<br>今ある建物に、新しい価値を加えること。<br>そして、その周りの環境まで整えること。</p><p>蒼建は、建築・改修・土木の3つの事業を通して、<br>街と暮らしのこれからを支えます。</p></div></div></div></section>
<section class="section service-introduction"><div class="wrap service-intro-layout"><div><p class="eyebrow">OUR SERVICE</p><h2 class="section-title"><span class="service-line">街と暮らしを支える、</span><br>3つの事業。</h2></div><p class="copy">蒼建は、建築工事、改修・リノベーション、土木・外構工事を一貫して担う総合建設会社です。建物そのものから周辺環境まで広い視野で捉え、地域の協力会社と技術をつなぎながら、一つひとつの計画に誠実に向き合います。</p></div></section>
<section class="service-showcase" aria-label="3つの事業"><article class="service-feature" id="architecture"><div class="service-feature-image"><img src="assets/images/service-building.webp" alt="木造住宅の建築現場で施工状況を確認する技術者" width="1536" height="1024" loading="lazy" decoding="async"></div><div class="service-feature-copy"><div class="service-feature-heading"><span class="service-feature-number">01</span><p>BUILDING CONSTRUCTION</p></div><h2>建築工事</h2><p>住宅、店舗、オフィス、地域施設など、さまざまな用途の建築工事に対応します。計画の意図を正確に読み取り、設計者や専門工事の協力会社と連携しながら、品質・安全・工程を丁寧に管理します。</p><p>完成させることだけを目的にせず、使う人の動きや過ごし方、その建物が街の中で担う役割まで考える。対話を重ね、長く安心して使える建物へと、想いを確かな形にしていきます。</p><p class="service-scope">住宅新築　／　店舗・オフィス　／　地域施設　／　施工管理</p></div></article>
<article class="service-feature service-feature--reverse" id="renovation"><div class="service-feature-image"><img src="assets/images/service-renovation.webp" alt="既存建物の内装を丁寧に改修するリノベーション現場" width="1536" height="1024" loading="lazy" decoding="async"></div><div class="service-feature-copy"><div class="service-feature-heading"><span class="service-feature-number">02</span><p>RENOVATION</p></div><h2>改修・リノベーション</h2><p>店舗やオフィスの改修、住宅のリノベーションに対応します。まず既存建物の状態を確かめ、これまで大切に使われてきた素材や構造のうち、残せるものを見極めます。</p><p>ただ新しくするのではなく、今の暮らし方や働き方に合う機能と心地よさを加えること。営業や生活への影響にも配慮しながら、建物が積み重ねてきた時間を次の価値へつなぎます。</p><p class="service-scope">店舗改修　／　オフィス改修　／　住宅リノベーション　／　用途変更</p></div></article>
<article class="service-feature" id="civil"><div class="service-feature-image"><img src="assets/images/service-civil.webp" alt="建物周辺の舗装と外構を整備する施工現場" width="1536" height="1024" loading="lazy" decoding="async"></div><div class="service-feature-copy"><div class="service-feature-heading"><span class="service-feature-number">03</span><p>CIVIL / EXTERIOR</p></div><h2>土木・外構工事</h2><p>造成、舗装、アプローチや駐車場、植栽スペースなど、敷地と建物をつなぐ工事を行います。日々の使いやすさはもちろん、排水や安全性、周辺環境との調和まで含めて計画します。</p><p>建物をつくって終わるのではなく、その周辺まで整えて街につなげる。人の動きと地域の風景を見据え、暮らしを足元から支える環境をつくります。</p><p class="service-scope">造成　／　舗装　／　外構　／　植栽スペース　／　建物周辺整備</p></div></article></section>
<section class="section service-process"><div class="wrap"><p class="eyebrow">PROCESS</p><div class="service-section-lead"><h2 class="section-title">ご相談から、<br>その先まで。</h2><p class="copy">計画の初期段階から、お引渡し後まで。状況を共有し、次の工程を確かめながら、責任を持って進めます。</p></div><ol class="process-list"><li><span>01</span><h3>ご相談</h3><p>用途やご希望、時期、ご予算など、決まっている範囲からお聞かせください。</p></li><li><span>02</span><h3>現地調査・計画</h3><p>敷地や建物の状態を確認し、条件を整理して実現方法をご提案します。</p></li><li><span>03</span><h3>お見積り</h3><p>工事内容と費用、工程を分かりやすくご説明し、認識を丁寧にそろえます。</p></li><li><span>04</span><h3>施工</h3><p>安全・品質・工程を管理し、関係者と連携しながら着実に工事を進めます。</p></li><li><span>05</span><h3>お引渡し・アフター対応</h3><p>仕上がりをご確認いただき、お引渡し後のご相談にも継続して対応します。</p></li></ol></div></section>
<section class="section service-policy"><div class="wrap"><div class="service-section-lead"><div><p class="eyebrow">OUR POLICY</p><h2 class="section-title"><span class="service-line">見えないところまで、</span><br>誠実に。</h2></div><p class="copy">建物の品質は、完成後には見えない日々の判断に表れます。蒼建は、すべての現場で変わらない3つの姿勢を大切にしています。</p></div><div class="policy-list"><article><span>01</span><p class="policy-en">SAFETY</p><h3>安全</h3><p>現場で働く人だけでなく、周辺で暮らす人や行き交う人まで考え、整理・確認・声かけを積み重ねます。</p></article><article><span>02</span><p class="policy-en">QUALITY</p><h3>品質</h3><p>完成後には見えなくなる部分まで確認・記録し、定めた基準を守りながら、一つひとつ丁寧に施工します。</p></article><article><span>03</span><p class="policy-en">DIALOGUE</p><h3>対話</h3><p>お客様、設計者、協力会社との対話を大切にし、目的と状況を共有しながら、より良い判断につなげます。</p></article></div></div></section>
<section class="service-contact"><div class="wrap service-contact-inner"><div><p class="eyebrow">CONTACT</p><h2>建築・改修・外構の<br>ご相談はこちら。</h2><p>まだ具体的に決まっていない段階でも構いません。<br>計画や建物について、まずはお話をお聞かせください。</p></div><div class="service-contact-actions">${link('contact.html','お問い合わせ','button')}<a class="service-phone" href="tel:00000000000"><span>PHONE</span>000-0000-0000</a></div></div></section>`],
 works:['WORKS','施工実績','人と街の営みに寄り添う、蒼建の仕事。',`<h2 class="section-title">その場所の、これからをつくる。</h2><p class="copy">住まい、商い、働く場所。それぞれの目的と向き合った仕事をご紹介します。</p><article class="detail-block" id="house">${media('work-house','光と庭をつなぐ家の外観','01 / RESIDENCE')}<div class="work-meta"><span>住宅 / 新築</span><span>福岡市西区 · 2025</span></div><h2>光と庭をつなぐ家</h2><p>庭と室内がゆるやかにつながる住まい。家族が集まる場所に自然光を取り込み、日々の暮らしに心地よい余白をつくりました。</p></article><article class="detail-block" id="shop">${media('work-shop','街角のベーカリーの内観','02 / COMMERCIAL')}<div class="work-meta"><span>店舗 / 改修</span><span>福岡市中央区 · 2025</span></div><h2>街角のベーカリー</h2><p>訪れる人にも、働く人にもやさしい店舗へ。木の温かさを生かしながら、接客と作業の動線を整理した改修計画です。</p></article>`],
 company:['COMPANY','会社案内','福岡に根ざし、人と街の未来をつくる。',`<div id="philosophy"><p class="eyebrow">OUR PHILOSOPHY</p><h2 class="section-title">誠実な仕事で、<br>この街の明日を支える。</h2><p class="copy">私たちが大切にするのは、目の前の一人に誠実であること。約束を守ること。技術を学び続けること。その積み重ねが、長く安心して使える建物と、地域からの信頼につながると考えています。</p></div><article class="detail-block"><h2>人を育て、仕事をつなぐ。</h2><p>若手の新しい視点と、経験を重ねた技術。その両方を大切にしながら、福岡で必要とされる建設会社を目指しています。地域の協力会社と力を合わせ、一つひとつの現場から街に貢献していきます。</p><p style="margin-top:20px">代表取締役　架空 太郎</p></article><div class="detail-block"><h2>会社概要</h2><p>以下の企業情報は、ポートフォリオ用の架空設定です。</p><dl class="overview"><div><dt>商号</dt><dd>株式会社 蒼建 / SOKEN CONSTRUCTION</dd></div><div><dt>代表者</dt><dd>代表取締役 架空 太郎</dd></div><div><dt>本社所在地</dt><dd>福岡県福岡市（架空）</dd></div><div><dt>設立</dt><dd>2014年4月</dd></div><div><dt>資本金</dt><dd>2,000万円</dd></div><div><dt>従業員数</dt><dd>24名（2026年4月時点）</dd></div><div><dt>事業内容</dt><dd>建築工事、改修・リノベーション、土木・外構工事、施工管理</dd></div></dl></div>`],
 recruit:['RECRUIT','採用情報','君の一歩が、街の未来になる。',`<h2 class="section-title">はじめの一歩を、<br>一人にしない。</h2><p class="copy">図面の読み方も、現場での声のかけ方も、最初は誰もが初心者です。先輩のそばで一つずつ経験し、できることを増やしていく。蒼建は、学びたい気持ちを大切にする会社です。</p><article class="detail-block"><h2>現場で学び、仲間と育つ。</h2><p>入社後は安全の基本から学び、先輩社員と現場へ。施工の流れ、品質の確認、協力会社との連携を段階的に身につけます。資格取得に向けた学習も、日々の仕事とあわせて支えます。</p></article><article class="detail-block"><h2>私たちの仕事</h2><p>施工管理は、建物づくりの進行役。品質・安全・工程を確認し、多くの人と協力して一つの現場を完成へ導きます。人の話を聞く力や、丁寧に確認する姿勢も、大切な技術です。</p></article><div class="detail-block"><h2>募集職種</h2><dl class="overview"><div><dt>職種</dt><dd>建築施工管理 / 施工管理アシスタント</dd></div><div><dt>勤務地</dt><dd>福岡市および近郊の施工現場</dd></div><div><dt>求める人物像</dt><dd>ものづくりに興味があり、仲間と協力しながら学べる方</dd></div></dl><p class="section-note">募集条件・選考の流れは、今後このページに掲載します。</p>${link('contact.html#recruit-contact','採用について')}</div>`],
 contact:['CONTACT','お問い合わせ','事業・施工・採用についてのご相談。',`<h2 class="section-title">まずは、お話を<br>聞かせてください。</h2><p class="copy">新築や改修の計画から、敷地まわりのお困りごとまで。ご相談の際にお伺いする内容をご案内します。</p><div class="contact-options"><details open><summary>建築・改修・土木工事のご相談</summary><p>建設予定地、現在の建物の状況、ご希望の用途、時期、ご予算など。決まっている範囲の情報をお知らせいただくことで、より具体的なご案内ができます。</p></details><details id="recruit-contact"><summary>採用についてのご相談</summary><p>希望する職種や、これまでのご経験、働くうえで気になっていることなど。建設の仕事が初めての方にも、仕事内容から丁寧にご案内します。</p></details></div><aside class="notice"><p><strong>このサイトをご覧の方へ</strong><br>本サイトはTUMIKI Web.の制作実績として公開する架空企業のコンセプトサイトです。実際の工事相談・採用応募は受け付けていません。電話番号はダミーです。フォームは入力操作を体験するためのもので、内容の送信・保存は行いません。</p></aside>${require('./contact-demo.cjs')}`]
};
for(const [id,[en,ja,desc,body]] of Object.entries(pages)) fs.writeFileSync(`${id}.html`,formatHtml(page(id,`${ja}｜株式会社 蒼建`,desc,inner(id,en,ja,body))));


