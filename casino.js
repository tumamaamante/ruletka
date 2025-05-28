// Logika kasyna
let stanKonta = 10000;
let aktualnaGra = null;
let aktualnaStawka = null;

// Zmienne automatów
const symboleAutomatow = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

// Zmienne blackjacka
let talia = [];
let kartyGracza = [];
let kartyKrupiera = [];
let graWToku = false;

// Funkcje pomocnicze
function aktualizujStanKonta(kwota) {
  stanKonta += kwota;
  document.getElementById('stan-konta').textContent = stanKonta.toLocaleString();
  
  if (stanKonta <= 0) {
    alert('Skończyły ci się pieniądze! Resetujemy do 10 000 PLN');
    stanKonta = 10000;
    document.getElementById('stan-konta').textContent = stanKonta.toLocaleString();
  }
}

// LOGIKA AUTOMATÓW
function kręćAutomaty() {
  const stawka = parseInt(document.getElementById('stawka-automat').value);
  
  if (stanKonta < stawka) {
    alert('Niewystarczające środki!');
    return;
  }
  
  aktualizujStanKonta(-stawka);
  
  // Animacja automatów
  const automaty = ['automat1', 'automat2', 'automat3'];
  const wyniki = [];
  
  automaty.forEach((idAutomat, index) => {
    const automat = document.getElementById(idAutomat);
    automat.classList.add('slot-reel');
    
    setTimeout(() => {
      const symbol = symboleAutomatow[Math.floor(Math.random() * symboleAutomatow.length)];
      automat.textContent = symbol;
      wyniki.push(symbol);
      automat.classList.remove('slot-reel');
      
      if (index === 2) {
        sprawdzWynikAutomatow(wyniki, stawka);
      }
    }, 500 + (index * 200));
  });
}

function sprawdzWynikAutomatow(wyniki, stawka) {
  const wynikDiv = document.getElementById('wynik-automat');
  
  // Sprawdź wygrane
  if (wyniki[0] === wyniki[1] && wyniki[1] === wyniki[2]) {
    // Trzy takie same
    let mnoznik = 5;
    if (wyniki[0] === '💎') mnoznik = 20;
    else if (wyniki[0] === '7️⃣') mnoznik = 15;
    else if (wyniki[0] === '🔔') mnoznik = 10;
    
    const wygrana = stawka * mnoznik;
    aktualizujStanKonta(wygrana);
    wynikDiv.innerHTML = `<span class="text-green-400 win-glow">🎉 JACKPOT! Wygrałeś ${wygrana} PLN! 🎉</span>`;
  } else if (wyniki[0] === wyniki[1] || wyniki[1] === wyniki[2] || wyniki[0] === wyniki[2]) {
    // Dwa takie same
    const wygrana = stawka * 2;
    aktualizujStanKonta(wygrana);
    wynikDiv.innerHTML = `<span class="text-yellow-400">✨ Dwa takie same! Wygrałeś ${wygrana} PLN! ✨</span>`;
  } else {
    wynikDiv.innerHTML = `<span class="text-red-400">💸 Tym razem bez wygranej. Spróbuj jeszcze raz! 💸</span>`;
  }
  
  setTimeout(() => {
    wynikDiv.innerHTML = '';
  }, 3000);
}

// LOGIKA BLACKJACKA
function utworzTalii() {
  const kolory = ['♠️', '♥️', '♦️', '♣️'];
  const figury = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  talia = [];
  
  for (let kolor of kolory) {
    for (let figura of figury) {
      talia.push({ figura, kolor, wartosc: pobierzWartoscKarty(figura) });
    }
  }
  
  // Tasuj talię
  for (let i = talia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [talia[i], talia[j]] = [talia[j], talia[i]];
  }
}

function pobierzWartoscKarty(figura) {
  if (figura === 'A') return 11;
  if (['J', 'Q', 'K'].includes(figura)) return 10;
  return parseInt(figura);
}

function dobierzKartę() {
  return talia.pop();
}

function obliczPunkty(reka) {
  let punkty = 0;
  let asy = 0;
  
  for (let karta of reka) {
    punkty += karta.wartosc;
    if (karta.figura === 'A') asy++;
  }
  
  // Dostosuj dla asów
  while (punkty > 21 && asy > 0) {
    punkty -= 10;
    asy--;
  }
  
  return punkty;
}

function wyswietlKarte(karta, kontener) {
  const kartaDiv = document.createElement('div');
  kartaDiv.className = 'w-16 h-24 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center text-black font-bold card-flip';
  kartaDiv.innerHTML = `
    <div class="text-xs">${karta.figura}</div>
    <div class="text-lg">${karta.kolor}</div>
  `;
  kontener.appendChild(kartaDiv);
}

function rozpocznijGre() {
  const stawka = parseInt(document.getElementById('stawka-blackjack').value);
  
  if (stanKonta < stawka) {
    alert('Niewystarczające środki!');
    return;
  }
  
  aktualizujStanKonta(-stawka);
  aktualnaStawka = stawka;
  
  utworzTalii();
  kartyGracza = [];
  kartyKrupiera = [];
  graWToku = true;
  
  // Wyczyść poprzednie karty
  document.getElementById('karty-gracz').innerHTML = '';
  document.getElementById('karty-krupier').innerHTML = '';
  document.getElementById('wynik-blackjack').innerHTML = '';
  
  // Rozdaj początkowe karty
  kartyGracza.push(dobierzKartę());
  kartyKrupiera.push(dobierzKartę());
  kartyGracza.push(dobierzKartę());
  kartyKrupiera.push(dobierzKartę());
  
  aktualizujWidokBlackjacka();
  
  // Włącz/wyłącz przyciski
  document.getElementById('rozpocznij-btn').disabled = true;
  document.getElementById('dobierz-btn').disabled = false;
  document.getElementById('pas-btn').disabled = false;
  
  // Sprawdź blackjacka
  if (obliczPunkty(kartyGracza) === 21) {
    pas();
  }
}

function dobierzKarte() {
  if (!graWToku) return;
  
  kartyGracza.push(dobierzKartę());
  aktualizujWidokBlackjacka();
  
  if (obliczPunkty(kartyGracza) > 21) {
    zakonczGre('przegrana');
  }
}

function pas() {
  if (!graWToku) return;
  
  // Krupier dobiera karty
  while (obliczPunkty(kartyKrupiera) < 17) {
    kartyKrupiera.push(dobierzKartę());
  }
  
  aktualizujWidokBlackjacka();
  
  const punktyGracza = obliczPunkty(kartyGracza);
  const punktyKrupiera = obliczPunkty(kartyKrupiera);
  
  if (punktyKrupiera > 21) {
    zakonczGre('wygrana-krupier-przegral');
  } else if (punktyGracza > punktyKrupiera) {
    zakonczGre('wygrana-gracz');
  } else if (punktyKrupiera > punktyGracza) {
    zakonczGre('wygrana-krupier');
  } else {
    zakonczGre('remis');
  }
}

function aktualizujWidokBlackjacka() {
  const kontenerGracza = document.getElementById('karty-gracz');
  const kontenerKrupiera = document.getElementById('karty-krupier');
  
  // Wyczyść i ponownie wyświetl karty
  kontenerGracza.innerHTML = '';
  kontenerKrupiera.innerHTML = '';
  
  kartyGracza.forEach(karta => wyswietlKarte(karta, kontenerGracza));
  kartyKrupiera.forEach((karta, index) => {
    if (graWToku && index === 1) {
      // Ukryj drugą kartę krupiera podczas gry
      const ukrytaKarta = document.createElement('div');
      ukrytaKarta.className = 'w-16 h-24 bg-blue-600 rounded border-2 border-gray-300 flex items-center justify-center text-white font-bold';
      ukrytaKarta.innerHTML = '🂠';
      kontenerKrupiera.appendChild(ukrytaKarta);
    } else {
      wyswietlKarte(karta, kontenerKrupiera);
    }
  });
  
  document.getElementById('punkty-gracz').textContent = obliczPunkty(kartyGracza);
  document.getElementById('punkty-krupier').textContent = graWToku ? obliczPunkty([kartyKrupiera[0]]) : obliczPunkty(kartyKrupiera);
}

function zakonczGre(wynik) {
  graWToku = false;
  aktualizujWidokBlackjacka();
  
  const wynikDiv = document.getElementById('wynik-blackjack');
  
  switch (wynik) {
    case 'przegrana':
      wynikDiv.innerHTML = '<span class="text-red-400">💥 Przegrałeś! 💥</span>';
      break;
    case 'wygrana-krupier-przegral':
      aktualizujStanKonta(aktualnaStawka * 2);
      wynikDiv.innerHTML = '<span class="text-green-400">🎉 Krupier przegrał! Wygrałeś! 🎉</span>';
      break;
    case 'wygrana-gracz':
      aktualizujStanKonta(aktualnaStawka * 2);
      wynikDiv.innerHTML = '<span class="text-green-400">🎉 Wygrałeś! 🎉</span>';
      break;
    case 'wygrana-krupier':
      wynikDiv.innerHTML = '<span class="text-red-400">😞 Krupier wygrał! 😞</span>';
      break;
    case 'remis':
      aktualizujStanKonta(aktualnaStawka);
      wynikDiv.innerHTML = '<span class="text-yellow-400">🤝 Remis! 🤝</span>';
      break;
  }
  
  zresetujBlackjacka();
}

function zresetujBlackjacka() {
  document.getElementById('rozpocznij-btn').disabled = false;
  document.getElementById('dobierz-btn').disabled = true;
  document.getElementById('pas-btn').disabled = true;
}