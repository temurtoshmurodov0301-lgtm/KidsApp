// app.js — demo Sparrow Kids app logic (client-side only)
// Reads user from localStorage (saved by signup script.js)

(function(){
  const getJSON = (k, def=null) => {
    try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : def; } catch(e){ return def; }
  };
  const setJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const fmt = n => Number(n || 0).toFixed(2);

  const user = getJSON('sparrow_user');
  if(!user){
    // If no user, redirect back to signup
    alert('No signed-up user found. You will be returned to Sign Up.');
    window.location.href = 'index.html';
    throw new Error('no user');
  }

  // ensure sparrow_data exists
  let data = getJSON('sparrow_data', {
    balance: 100.00,
    locked: 0.00,
    messages: [],
    parentNote: null,
    transactions: [],
    pendingUnlockRequest: false,
    parentCodeDemo: 'PARENT123'
  });
  // ensure stored
  setJSON('sparrow_data', data);

  // Elements
  const balanceValue = document.getElementById('balanceValue');
  const welcome = document.getElementById('welcome');
  const cardMasked = document.getElementById('cardMasked');
  const parentNoteText = document.getElementById('parentNoteText');
  const replyInput = document.getElementById('replyInput');
  const replyBtn = document.getElementById('replyBtn');
  const transactionsList = document.getElementById('transactionsList');
  const messagesList = document.getElementById('messagesList');
  const payAmount = document.getElementById('payAmount');
  const payBtn = document.getElementById('payBtn');
  const payMethod = document.getElementById('payMethod');
  const termToggle = document.getElementById('termToggle');
  const payStatus = document.getElementById('payStatus');
  const pinkyAmount = document.getElementById('pinkyAmount');
  const pinkyBtn = document.getElementById('pinkyBtn');
  const availVal = document.getElementById('availVal');
  const lockedVal = document.getElementById('lockedVal');
  const requestUnlock = document.getElementById('requestUnlock');
  const unlockStatus = document.getElementById('unlockStatus');
  const openParent = document.getElementById('openParent');
  const parentPanel = document.getElementById('parentPanel');
  const noteInput = document.getElementById('noteInput');
  const sendNote = document.getElementById('sendNote');
  const topUp = document.getElementById('topUp');
  const approveUnlock = document.getElementById('approveUnlock');
  const rejectUnlock = document.getElementById('rejectUnlock');
  const closeParentPanel = document.getElementById('closeParentPanel');
  const logout = document.getElementById('logout');
  const termStatusToggle = { on: false };

  // initialize UI
  welcome.innerText = `Welcome, ${user.name}!`;
  cardMasked.innerText = user.cardMasked || '**** **** **** 1234';

  function refreshUI(){
    data = getJSON('sparrow_data');
    balanceValue.innerText = fmt(data.balance);
    availVal.innerText = fmt(data.balance);
    lockedVal.innerText = fmt(data.locked);
    parentNoteText.innerText = data.parentNote ? data.parentNote.text : 'No notes yet. Ask your parent to send one!';
    unlockStatus.innerText = data.pendingUnlockRequest ? 'Unlock requested — waiting for parent' : '—';

    // messages
    messagesList.innerHTML = '';
    (data.messages || []).slice().reverse().forEach(m=>{
      const li = document.createElement('li');
      li.textContent = `${m.from}: ${m.text} ${m.time ? '(' + new Date(m.time).toLocaleTimeString() + ')' : ''}`;
      messagesList.appendChild(li);
    });

    // transactions
    transactionsList.innerHTML = '';
    (data.transactions || []).slice().reverse().forEach(t=>{
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `<strong>${t.type}</strong><div class="muted" style="font-size:12px">${t.note||''}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<div style="font-weight:800">${t.amount < 0 ? '-₮'+fmt(Math.abs(t.amount)) : '₮'+fmt(t.amount)}</div><div class="muted" style="font-size:12px">${t.status}</div>`;
      li.appendChild(left); li.appendChild(right);
      transactionsList.appendChild(li);
    });
  }

  refreshUI();

  // Reply
  replyBtn.addEventListener('click', ()=>{
    const txt = replyInput.value.trim();
    if(!txt) return alert('Write something to send.');
    data.messages.push({ from:'Kid', text:txt, time: Date.now() });
    setJSON('sparrow_data', data);
    replyInput.value = '';
    refreshUI();
    alert('Reply sent (demo).');
  });

  // Pay
  payBtn.addEventListener('click', ()=>{
    const amt = Number(payAmount.value);
    if(!amt || amt <= 0) return alert('Enter an amount.');
    if(amt > data.balance) return alert('Not enough balance. Ask parent to top up.');
    const method = payMethod.value;
    if(method === 'card' && termStatusToggle.on){
      if(!confirm('Terminal is simulated as down. Use Transfer instead?')) return;
    }
    data.balance -= amt;
    data.transactions.push({ type:'Payment', amount:-amt, time: Date.now(), status:'Completed', note: method === 'transfer' ? 'Transfer used' : 'Card terminal' });
    setJSON('sparrow_data', data);
    payAmount.value = '';
    payStatus.innerText = `Paid ₮${fmt(amt)} via ${method}.`;
    refreshUI();
  });

  termToggle.addEventListener('click', ()=>{
    termStatusToggle.on = !termStatusToggle.on;
    termToggle.innerText = termStatusToggle.on ? 'Terminal = DOWN (click to toggle)' : 'Simulate Terminal';
    termToggle.style.borderColor = termStatusToggle.on ? '#F44336' : '';
  });

  // PinkyPig lock
  pinkyBtn.addEventListener('click', ()=>{
    const amt = Number(pinkyAmount.value);
    if(!amt || amt <= 0) return alert('Enter amount to lock.');
    if(amt > data.balance) return alert('Not enough available.');
    data.balance -= amt;
    data.locked += amt;
    data.transactions.push({ type:'Pinky Lock', amount:-amt, time: Date.now(), status:'Locked', note:'Waiting for parent' });
    setJSON('sparrow_data', data);
    pinkyAmount.value = '';
    refreshUI();
    alert(`₮${fmt(amt)} locked in PinkyPig! Ask parent to approve unlock.`);
  });

  requestUnlock.addEventListener('click', ()=>{
    if(data.locked <= 0) return alert('No locked funds to request unlock for.');
    data.pendingUnlockRequest = true;
    data.messages.push({ from:'Kid', text:'Please unlock my PinkyPig', time: Date.now() });
    setJSON('sparrow_data', data);
    refreshUI();
    alert('Unlock request sent to parent (demo).');
  });

  // Parent panel open with code
  openParent.addEventListener('click', ()=>{
    const code = prompt('Enter parent code (demo):');
    if(!code) return;
    if(code !== data.parentCodeDemo){
      alert('Wrong parent code (demo).');
      return;
    }
    parentPanel.classList.add('visible');
  });

  closeParentPanel.addEventListener('click', ()=> parentPanel.classList.remove('visible'));

  // Parent actions
  sendNote.addEventListener('click', ()=>{
    const txt = noteInput.value.trim();
    if(!txt) return alert('Write a note.');
    data.parentNote = { text: txt, time: Date.now() };
    data.messages.push({ from:'Parent', text: txt, time: Date.now() });
    setJSON('sparrow_data', data);
    noteInput.value = '';
    refreshUI();
    alert('Parent note sent (demo).');
  });

  topUp.addEventListener('click', ()=>{
    data.balance += 100;
    data.transactions.push({ type:'Parent Top-up', amount:100, time: Date.now(), status:'Completed', note:'Demo top-up' });
    setJSON('sparrow_data', data);
    refreshUI();
    alert('Parent added ₮100 (demo).');
  });

  approveUnlock.addEventListener('click', ()=>{
    if(!data.pendingUnlockRequest) return alert('No unlock request pending.');
    const amt = data.locked;
    data.balance += amt;
    data.locked = 0;
    data.pendingUnlockRequest = false;
    data.transactions.push({ type:'Pinky Unlock', amount:amt, time:Date.now(), status:'Approved', note:'Parent approved unlocked funds' });
    data.messages.push({ from:'Parent', text:`Okay! I unlocked ₮${fmt(amt)} for you. Use it wisely!`, time:Date.now() });
    setJSON('sparrow_data', data);
    refreshUI();
    alert('Unlocked and returned to kid balance (demo).');
  });

  rejectUnlock.addEventListener('click', ()=>{
    if(!data.pendingUnlockRequest) return alert('No unlock request pending.');
    data.pendingUnlockRequest = false;
    data.messages.push({ from:'Parent', text:'Not yet — keep saving!', time:Date.now() });
    setJSON('sparrow_data', data);
    refreshUI();
    alert('Unlock request rejected (demo).');
  });

  logout.addEventListener('click', ()=>{
    if(!confirm('Log out and remove demo data from this browser?')) return;
    localStorage.removeItem('sparrow_user');
    // keep data in case parent wants it, or remove both:
    // localStorage.removeItem('sparrow_data');
    window.location.href = 'index.html';
  });

  // Live refresh occasionally
  setInterval(refreshUI, 1200);
})();
