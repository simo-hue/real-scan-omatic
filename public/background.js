// background.js

// Funzione per creare la voce di menu
function creaMenuContestuale() {
  chrome.contextMenus.create({
    id: "miaAzioneImmagine",             // Un ID univoco per questa voce
    title: "Fai X con questa immagine",  // Il testo che l'utente vedrà
    contexts: ["image"]                  // <-- QUESTA È LA PARTE CHIAVE!
                                         // Appare solo se il contesto è un'immagine
  });
}

// 1. Crea il menu quando l'estensione viene installata o aggiornata
chrome.runtime.onInstalled.addListener(() => {
  creaMenuContestuale();
});

// 2. Ascolta l'evento 'onClicked' per quando l'utente clicca la tua voce di menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  
  // Controlla che il clic sia sulla voce di menu che abbiamo creato
  if (info.menuItemId === "miaAzioneImmagine") {
    
    // 'info.srcUrl' contiene l'URL dell'immagine su cui hai cliccato
    console.log("Immagine cliccata! URL:", info.srcUrl);

    // --- A QUESTO PUNTO, FAI QUELLO CHE DEVI FARE ---
    // Esempio 1: Apri l'immagine in una nuova scheda
    // chrome.tabs.create({ url: info.srcUrl });

    // Esempio 2: Invia l'URL a uno script di contenuto sulla pagina
    // chrome.tabs.sendMessage(tab.id, { tipo: "immagineCliccata", url: info.srcUrl });
    
    // Esempio 3: Invia l'URL a un tuo server
    // fetch('https://tuo-server.com/api/salva-immagine', {
    //   method: 'POST',
    //   body: JSON.stringify({ imageUrl: info.srcUrl })
    // });
  }
});