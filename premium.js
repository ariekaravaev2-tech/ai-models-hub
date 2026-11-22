/* Browser-local rewards. Paid access will require server-side accounts. */
(function (root) {
  'use strict';
  var DAY = 86400000, KEY = 'ai-guide-rewards-v1', SAVES = 'ai-guide-saves-v1';
  function dayNumber(now) {
    var d = new Date(now);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
  }
  function normalize(s) {
    s = s && typeof s === 'object' ? s : {};
    return { lastDay: Number.isInteger(s.lastDay) ? s.lastDay : null,
      streak: Number.isInteger(s.streak) && s.streak >= 0 ? s.streak : 0,
      trialUntil: Number.isFinite(s.trialUntil) && s.trialUntil > 0 ? s.trialUntil : 0 };
  }
  function nextVisit(previous, now) {
    var s = normalize(previous), today = dayNumber(now);
    if (s.lastDay !== null && today <= s.lastDay) return s;
    s.streak = s.lastDay === today - 1 ? s.streak + 1 : 1;
    s.lastDay = today;
    if (s.streak % 7 === 0) s.trialUntil = Math.max(now, s.trialUntil) + 3 * DAY;
    return s;
  }
  function active(s, now) { return normalize(s).trialUntil > now; }
  function workload(requests, input, output) {
    return { input: requests * input, output: requests * output, total: requests * (input + output) };
  }
  var api = { nextVisit: nextVisit, active: active, dayNumber: dayNumber, workload: workload };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.PremiumRewards = api;
  var state = normalize(load(KEY)), storageOK = true, saved = load(SAVES);
  if (!Array.isArray(saved)) saved = [];
  saved = saved.filter(function (s) {
    return s && typeof s.id === 'string' && typeof s.name === 'string' &&
      ((s.kind === 'compare' && byId(s.a) && byId(s.b)) ||
       (s.kind === 'tokens' && Number.isFinite(s.tokens) && s.tokens >= 1 && s.tokens <= 1e9 && [25,50,75,80,90].indexOf(s.share) !== -1));
  }).slice(0, 30);
  function persist(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); storageOK = true; return true; }
    catch (e) { storageOK = false; return false; }
  }
  var TEXT = {
    en: { title:'Premium workspace', intro:'Keep comparisons and explore your monthly API workload.', streak:'Daily streak', rule:'Visit on 7 consecutive days to unlock 3 days of Premium. Each new block of 7 consecutive days earns another 3 days.', counted:'Today is counted. Come back tomorrow.', left:'Days until your next reward', active:'Premium is active until', tools:'Your tools', compare:'Save this comparison', tokens:'Save this estimate', name:'Name', save:'Save', library:'Saved comparisons and estimates', empty:'No saved items yet. Save a comparison or token estimate during Premium.', open:'Open', remove:'Remove', locked:'Unlock these tools with your daily streak. Basic comparison and the token calculator stay free.', local:'Saved on this browser only. No payment, automatic renewal or access to paid AI provider plans. Clearing site data resets your progress and saves.', unavailable:'Browser storage is unavailable. Progress and saves will be lost when this page closes.', progress:'of 7 days toward the next reward', scenario:'Monthly workload', requests:'Requests per month', input:'Input tokens per request', output:'Output tokens per request', calculate:'Calculate monthly costs', assumptions:'Uses the current standard API rates. Caching, Batch, tools, media and long-context surcharges are excluded. Verify actual usage with your provider.', cap:'You can keep up to 30 items. Remove one before saving another.', saved:'Saved in this browser.', needed:'Enter a name of up to 60 characters.', invalid:'Use whole numbers from 0 to 1,000,000,000. Requests must be at least 1 and the workload must contain tokens.', total:'Monthly tokens', cost:'Monthly estimate', days:'Consecutive days', status:'Daily progress', notToday:'Open the site tomorrow to continue your streak.', note:'Saved estimates use the latest rates when reopened.', expired:'Your saved items stay available after Premium expires.', free:'Free', yes:'Included', unlimited:'Unlimited site-help questions', complete:'Reward earned: 3 days of Premium.', seven:'7 days completed', compareLabel:'Comparison', tokensLabel:'Token estimate' },
    he: { title:'סביבת הפרימיום שלך', intro:'שומרים השוואות ובודקים כמה יעלה השימוש החודשי ב־API.', streak:'רצף כניסות יומי', rule:'נכנסים 7 ימים רצופים ומקבלים 3 ימי פרימיום. כל מקטע נוסף של 7 ימים רצופים מעניק עוד 3 ימים.', counted:'הכניסה של היום נספרה. חוזרים מחר להמשך הרצף.', left:'ימים עד להטבה הבאה', active:'הפרימיום פעיל עד', tools:'הכלים שלך', compare:'שמור את ההשוואה', tokens:'שמור את ההערכה', name:'שם', save:'שמור', library:'השוואות והערכות שמורות', empty:'עדיין אין פריטים שמורים. בזמן הפרימיום אפשר לשמור השוואה או הערכת טוקנים.', open:'פתח', remove:'הסר', locked:'הכלים נפתחים באמצעות רצף הכניסות. ההשוואה הבסיסית ומחשבון הטוקנים נשארים בחינם.', local:'נשמר בדפדפן הזה בלבד. בלי תשלום או חידוש אוטומטי, ובלי גישה למנויי AI בתשלום אצל הספקים. ניקוי נתוני האתר מאפס את הרצף והשמירות.', unavailable:'האחסון בדפדפן אינו זמין. ההתקדמות והשמירות יאבדו בסגירת העמוד.', progress:'מתוך 7 ימים בדרך להטבה הבאה', scenario:'תרחיש שימוש חודשי', requests:'בקשות בחודש', input:'טוקני קלט לבקשה', output:'טוקני פלט לבקשה', calculate:'חשב עלויות חודשיות', assumptions:'החישוב לפי תעריפי ה־API הרגילים באתר. אינו כולל מטמון, Batch, כלים, מדיה או תוספת להקשר ארוך. יש לאמת את השימוש בפועל אצל הספק.', cap:'אפשר לשמור עד 30 פריטים. הסר פריט כדי לשמור חדש.', saved:'נשמר בדפדפן הזה.', needed:'יש להזין שם באורך של עד 60 תווים.', invalid:'יש להזין מספרים שלמים מ־0 עד מיליארד. נדרשת לפחות בקשה אחת וכמות טוקנים גדולה מאפס.', total:'טוקנים בחודש', cost:'עלות חודשית משוערת', days:'ימי כניסה רצופים', status:'התקדמות יומית', notToday:'פותחים את האתר מחר כדי להמשיך את הרצף.', note:'הערכות שמורות מחושבות לפי התעריפים המעודכנים בעת הפתיחה.', expired:'הפריטים השמורים נשארים זמינים גם אחרי שהפרימיום מסתיים.', free:'חינם', yes:'כלול', unlimited:'שאלות ללא הגבלה לבוט העזרה של האתר', complete:'ההטבה נפתחה: 3 ימי פרימיום.', seven:'הושלמו 7 ימים', compareLabel:'השוואה', tokensLabel:'הערכת טוקנים' }
  };
  function t(key) { return (TEXT[LANG] || TEXT.en)[key]; }
  isPro = function () { return active(state, Date.now()); };
  function progress() { return state.streak && state.streak % 7 === 0 ? 7 : state.streak % 7; }
  function streakHTML() {
    var p = progress(), until = new Date(state.trialUntil).toLocaleString(LANG || 'en');
    return '<section class="pro-streak"><div><span class="badge pro">Premium</span><h3>'+t('streak')+'</h3><p>'+t('rule')+'</p></div>'+
      '<div class="pro-count"><strong>'+state.streak+'</strong><span>'+t('days')+'</span></div>'+
      '<div class="pro-days" role="progressbar" aria-label="'+t('status')+'" aria-valuemin="0" aria-valuemax="7" aria-valuenow="'+p+'">'+[1,2,3,4,5,6,7].map(function(n){return '<span class="'+(n<=p?'done':'')+'">'+n+'</span>';}).join('')+'</div>'+
      '<p class="pro-status">'+(isPro()?t('active')+' <bdi>'+esc(until)+'</bdi>':(7-p)+' '+t('left'))+'</p><p class="note">'+(state.lastDay===dayNumber(Date.now())?t('counted'):t('notToday'))+'</p></section>';
  }
  function message(root, text) { var el=root.querySelector('[data-pro-message]'); if(el) el.textContent=text; }
  function saveForm(kind) {
    return '<form class="pro-save" data-save-kind="'+kind+'"><label>'+t('name')+'<input class="field" name="saveName" required maxlength="60" value="'+esc(kind==='compare'?byId(cmp.a).name+' / '+byId(cmp.b).name:tk.tokens.toLocaleString()+' tokens')+'"></label><button class="btn alt" type="submit">'+t(kind==='compare'?'compare':'tokens')+'</button><p class="note" data-pro-message role="status" aria-live="polite"></p></form>';
  }
  function bindSave(root, kind) {
    var form=root.querySelector('[data-save-kind]'); if(!form) return;
    form.addEventListener('submit',function(e){
      e.preventDefault(); if(!isPro()){message(form,t('locked'));return;}
      var name=form.elements.saveName.value.trim(); if(!name || name.length>60){message(form,t('needed'));return;}
      if(saved.length>=30){message(form,t('cap'));return;}
      var s={id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),kind:kind,name:name};
      if(kind==='compare'){s.a=cmp.a;s.b=cmp.b;}else{s.tokens=tk.tokens;s.share=tk.share;s.peak=tk.peak;s.model=tk.model || '';}
      saved.push(s); persist(SAVES,saved);message(form,t(storageOK?'saved':'unavailable'));
    });
  }
  function savedHTML() {
    return '<section class="pro-library"><h3>'+t('library')+'</h3><p class="note">'+t('note')+' '+t('expired')+'</p>'+
      (saved.length?'<ul class="pro-saves">'+saved.map(function(s){return '<li><div><strong>'+esc(s.name)+'</strong><span class="note">'+t(s.kind==='compare'?'compareLabel':'tokensLabel')+'</span></div><button class="btn alt" data-restore="'+esc(s.id)+'">'+t('open')+'</button><button class="btn ghost" data-remove-save="'+esc(s.id)+'">'+t('remove')+'</button></li>';}).join('')+'</ul>':'<p>'+t('empty')+'</p>')+'</section>';
  }
  function scenarioHTML() {
    return '<section class="pro-scenario"><h3>'+t('scenario')+'</h3><form id="workloadForm"><div class="pro-fields">'+[['requests',1000],['input',800],['output',200]].map(function(a){return '<label>'+t(a[0])+'<input class="field" type="number" name="'+a[0]+'" min="'+(a[0]==='requests'?1:0)+'" max="1000000000" step="1" required value="'+a[1]+'"></label>';}).join('')+'</div><button class="btn" type="submit">'+t('calculate')+'</button></form><p role="status" aria-live="polite" data-pro-message></p><div class="tbl" id="workloadResults"></div><p class="note">'+t('assumptions')+'</p></section>';
  }
  function premiumWindow() {
    return '<div class="pro-workspace"><p>'+t('intro')+'</p>'+streakHTML()+'<h3>'+t('tools')+'</h3>'+
      (isPro()?scenarioHTML():'<p>'+t('locked')+'</p>')+savedHTML()+'<p class="note">'+t('local')+'</p>'+(!storageOK?'<p role="status">'+t('unavailable')+'</p>':'')+'</div>';
  }
  function bindPremium(root) {
    var form=root.querySelector('#workloadForm');
    if(form) form.addEventListener('submit',function(e){
      e.preventDefault(); if(!isPro()){message(root,t('locked'));return;}
      var nums=['requests','input','output'].map(function(k){return Number(form.elements[k].value);});
      if(nums.some(function(n){return !Number.isInteger(n)||n<0||n>1e9;})||nums[0]<1||nums[1]+nums[2]===0){message(root,t('invalid'));return;}
      var w=workload(nums[0],nums[1],nums[2]);
      message(root,t('total')+': '+w.total.toLocaleString());
      var rows=API_MODELS.map(function(m){return {name:m.name,cost:(w.input*m.input+w.output*m.output)/1e6};}).sort(function(a,b){return a.cost-b.cost;});
      root.querySelector('#workloadResults').innerHTML='<table><thead><tr><th>Model</th><th>'+t('cost')+'</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+esc(r.name)+'</td><td>'+usd(r.cost)+'</td></tr>';}).join('')+'</tbody></table>';
    });
    root.onclick=function(e){
      var b=e.target.closest('[data-restore], [data-remove-save]');if(!b)return;
      if(b.hasAttribute('data-remove-save')){saved=saved.filter(function(s){return s.id!==b.dataset.removeSave;});persist(SAVES,saved);root.innerHTML=premiumWindow();bindPremium(root);return;}
      var s=saved.find(function(x){return x.id===b.dataset.restore;});if(!s)return;
      if(s.kind==='compare'){cmp.a=s.a;cmp.b=s.b;openWindow('compare',null);}
      else{tk.tokens=s.tokens;tk.share=s.share;tk.peak=!!s.peak;tk.model=s.model;openWindow('tokens',null);}
    };
  }
  WINDOWS.upgrade={title:'Premium',render:premiumWindow,bind:bindPremium};
  BOT_RULES[2][1]='Visit on 7 consecutive days to unlock 3 days of Premium. Premium adds saved comparisons, saved token estimates and monthly workload calculations. Progress and saves stay in this browser. No payment is connected.';
  NAV.forEach(function(n){if(n[0]==='upgrade')n[1]='Premium';});
  var oldCompare=compareWin, oldBindCompare=bindCompare, oldTokens=tokensWin, oldBindTokens=bindTokens;
  compareWin=function(){return oldCompare()+(isPro()?saveForm('compare'):'<p class="note"><button class="btn alt" data-pro-open>'+t('compare')+' · Premium</button></p>');};
  bindCompare=function(root){oldBindCompare(root);bindSave(root,'compare');var b=root.querySelector('[data-pro-open]');if(b)b.addEventListener('click',function(){openWindow('upgrade',null);});};
  tokensWin=function(){return oldTokens()+(isPro()?saveForm('tokens'):'<p class="note"><button class="btn alt" data-pro-open>'+t('tokens')+' · Premium</button></p>');};
  bindTokens=function(root){oldBindTokens(root);bindSave(root,'tokens');var b=root.querySelector('[data-pro-open]');if(b)b.addEventListener('click',function(){openWindow('upgrade',null);});};
  WINDOWS.compare.render=compareWin;WINDOWS.compare.bind=bindCompare;WINDOWS.tokens.render=tokensWin;WINDOWS.tokens.bind=bindTokens;
  var oldHome=home;
  home=function(){return '<section class="pro-banner"><div><b>'+t('streak')+'</b><span>'+state.streak+' '+t('days')+' · '+(isPro()?'Premium':t('rule'))+'</span></div><button class="btn alt" data-open="upgrade">Premium</button></section>'+oldHome();};
  var oldSetLang=setLang;
  setLang=function(code){oldSetLang(code);if(current&&current.id==='upgrade'){current.overlay.querySelector('#pbody').innerHTML=premiumWindow();bindPremium(current.overlay.querySelector('#pbody'));}};
  var lastActive=isPro();
  function checkVisit(){
    if(document.visibilityState==='hidden')return;
    var previous=JSON.stringify(state);state=nextVisit(load(KEY)||state,Date.now());
    var changed=JSON.stringify(state)!==previous;
    if(changed)persist(KEY,state);
    if(!changed && lastActive===isPro())return;
    lastActive=isPro();
    paintBar();renderHome();
    if(current&&current.id==='upgrade'){var body=current.overlay.querySelector('#pbody');body.innerHTML=premiumWindow();bindPremium(body);}
  }
  document.addEventListener('visibilitychange',checkVisit);
  window.addEventListener('focus',checkVisit);
  window.addEventListener('storage',function(e){if(e.key===KEY){state=normalize(load(KEY));checkVisit();}});
  setInterval(checkVisit,60000);
  checkVisit();paintBar();renderHome();
})(typeof window==='undefined'?this:window);