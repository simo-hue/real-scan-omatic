# RealityRadar - Estensione Chrome

## 📦 Installazione dell'estensione

### 1. Build dell'estensione

```bash
npm run build
```

Questo comando creerà una cartella `dist/` con tutti i file necessari per l'estensione.

### 2. Caricamento in Chrome

1. Apri Chrome e vai a `chrome://extensions/`
2. Attiva la "Modalità sviluppatore" in alto a destra
3. Clicca su "Carica estensione non pacchettizzata"
4. Seleziona la cartella `dist/` del progetto
5. L'estensione RealityRadar apparirà nella toolbar di Chrome

### 3. Utilizzo

- Clicca sull'icona di RealityRadar nella toolbar
- Si aprirà il popup dell'estensione (400x500px)
- Carica immagini, video o testi per analizzarli
- I risultati verranno mostrati direttamente nel popup

## 🔧 Configurazione

### Manifest V3
L'estensione utilizza Manifest V3, lo standard più recente di Chrome.

### Permessi richiesti
- `activeTab`: Per interagire con la tab attiva
- `storage`: Per salvare preferenze e dati locali
- `host_permissions`: Per comunicare con le API di analisi

### Content Security Policy
CSP strict configurato per massima sicurezza:
```
script-src 'self'; object-src 'self'
```

## 🛠️ Sviluppo

### Build per estensione
```bash
npm run build
```

### Struttura ottimizzata
- **MemoryRouter**: Routing senza URL per popup
- **Build ottimizzato**: Output specifico per estensioni
- **CSP compatibile**: Nessun eval o inline scripts

## 📝 Note tecniche

### Differenze rispetto alla web app
1. Usa `MemoryRouter` invece di `BrowserRouter`
2. Dimensioni popup fisse (400x500px)
3. CSP più restrittive
4. Build con chunking ottimizzato

### Dimensioni consigliati del popup
- Larghezza: 400px (fisso)
- Altezza minima: 500px
- Scroll verticale automatico per contenuti lunghi

## 🚀 Pubblicazione su Chrome Web Store

Per pubblicare l'estensione ufficialmente:

1. Comprimi la cartella `dist/` in un file `.zip`
2. Vai su [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Carica il file `.zip`
4. Compila le informazioni richieste
5. Invia per la revisione

### Requisiti per la pubblicazione
- Account Google Developer ($5 una tantum)
- Icone di qualità (16x16, 48x48, 128x128)
- Screenshot dell'estensione
- Privacy policy (se raccogli dati utente)
- Descrizione dettagliata

## 🔒 Sicurezza

L'estensione è configurata con:
- CSP strict (no eval, no inline scripts)
- Permessi minimi necessari
- Comunicazioni HTTPS only
- Storage locale sicuro

## 🆘 Troubleshooting

### L'estensione non si carica
- Verifica che `dist/manifest.json` esista
- Controlla che tutti gli assets siano in `dist/assets/`
- Verifica la console di Chrome per errori

### Gli stili non funzionano
- Assicurati che il build sia completo
- Verifica che i file CSS siano in `dist/assets/`

### Problemi con le API
- Controlla che le variabili d'ambiente siano configurate
- Verifica la connessione internet
- Controlla la console per errori CORS
