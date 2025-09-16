// script.js (replace your existing file with this)
// Minimal change: keep the signup layout/flow but save profile to localStorage and open app.html

const form = document.getElementById("signupForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const cardRaw = document.getElementById("card").value.replace(/\s+/g, '');
  // allow if user typed spaces or grouped digits
  if (!name || !age) {
    alert("Please enter your name and age.");
    return;
  }

  if (cardRaw.length !== 16 || /\D/.test(cardRaw)) {
    alert("Card number must be 16 digits!");
    return;
  }

  // Mask card for storage
  const masked = "**** **** **** " + cardRaw.slice(-4);

  // Save user profile in localStorage
  const user = {
    name,
    age: Number(age),
    cardMasked: masked,
    createdAt: Date.now()
  };
  localStorage.setItem("sparrow_user", JSON.stringify(user));

  // Initialize app data if missing (demo defaults)
  if (!localStorage.getItem("sparrow_data")) {
    const demoData = {
      balance: 100.00,
      locked: 0.00,                 // PinkyPig locked amount
      messages: [],                 // message history
      parentNote: null,             // latest parent note
      transactions: [],             // transactions history
      pendingUnlockRequest: false,
      parentCodeDemo: "PARENT123"   // demo parent code
    };
    localStorage.setItem("sparrow_data", JSON.stringify(demoData));
  }

  // Slight fun message then open app
  // Keep the look/layout unchanged — we just navigate to the app after signup.
  setTimeout(() => {
    window.location.href = "app.html";
  }, 200);
});
