# Ortu Lupiae — gestione delle spese dell'orto

Gestionale per telefono delle spese dell'orto: **nove voci**, storico, statistiche,
backup. Un file HTML che contiene tutta l'app; i dati stanno nella memoria del browser
del telefono e non vengono inviati da nessuna parte.

È lo stesso motore di `Auto Manager` (il gestionale delle spese auto), riportato sul
marchio Ortu Lupiae: colori dell'etichetta, carattere del marchio, e le voci dell'orto.

## Le nove voci

Le voci sono fisse e sono quelle che danno forma a storico e statistiche:

| | | |
|---|---|---|
| **Aratura** | **Attrezzi** | **Concimi** |
| **Fitofarmaci** | **Gestione** | **Manutenzione** |
| **Piante** | **Sementi** | **Taglio** |

Ogni voce ha un colore suo, preso dalla tavolozza del marchio (oliva `#556B2F`,
terra rossa `#A84838`, giallo ocra `#C69214`, azzurro mare `#5B7B88`), così la
torta delle statistiche si legge a colpo d'occhio. Se un giorno arriva una voce
fuori elenco — per esempio da un vecchio backup — finisce in *Altre* invece di
sparire dai conti.

## Le schermate

| Schermata | A che serve |
|---|---|
| **Home** | totale speso e le quattro porte d'ingresso |
| **Nuova** | registrare una spesa: data, voce, importo, note |
| **Storico** | tutte le voci, dalla più recente, con il colore della voce |
| **Grafici** | totale, torta per voce, colonne mese per mese |
| **Modifica** | correggere o eliminare una voce sbagliata |
| **Backup** | (dall'ingranaggio in alto) esporta, importa, PIN, azzera |

## File

| File | A che serve |
|---|---|
| `index.html` | l'app intera: schermate, calcolo, salvataggio, grafici |
| `manifest.json` | fa installare l'app sulla schermata Home con nome e icona |
| `sw.js` | la rende disponibile senza rete (solo se servita da https) |
| `icona-192.png`, `icona-512.png` | icone per la Home, ricavate dal marchio |
| `logo.png` | il marchio nella schermata del PIN |
| `dati-iniziali.json` | vuoto: serve solo se un giorno vuoi precaricare delle voci |
| `anteprima-home.png`, `anteprima-statistiche.png` | come si vede l'app sul telefono |

## Come provarla dal telefono (senza pubblicare niente)

1. Il PC deve essere acceso e sulla stessa rete Wi-Fi del telefono.
2. Sul PC, nella cartella dell'app:

   ```
   python -m http.server 8099 --bind 0.0.0.0
   ```

3. Dal telefono apri: **http://192.168.1.35:8099/index.html**
   (se l'indirizzo del PC cambia, si legge con `ipconfig`.)

Se il telefono non si connette, quasi sempre è il firewall di Windows che blocca
la porta 8099: va concessa l'eccezione per Python.

Questa modalità serve solo per giudicare l'app. **Non è la sua casa definitiva**: i dati
restano legati a quell'indirizzo, che cambia se cambia la rete.

## Come metterla in pianta stabile

Serve un indirizzo web fisso e sicuro (https), perché il browser lega i dati
all'indirizzo. Due strade, entrambe gratuite:

- **Netlify Drop** (`app.netlify.com/drop`): si trascina la cartella nel browser e si
  ottiene subito un indirizzo. Zero configurazione.
- **GitHub Pages**: si carica la cartella in un repository e si attiva Pages. Indirizzo
  più stabile e "tuo".

Da lì, aprendo l'indirizzo dal telefono, Chrome propone *«Aggiungi alla schermata Home»*:
l'icona compare fra le app, si apre a schermo pieno e funziona anche senza rete.

## Dove stanno i dati, e come non perderli

I dati sono in `localStorage`, dentro il browser del telefono, legati all'indirizzo
dell'app. **Non c'è nessun server.** Conseguenze:

- Si perdono se si cancellano i «dati di navigazione» o si svuota la memoria dei siti.
- Si perdono se muore il telefono.
- Non sono visibili dal PC.

Per questo l'app ha un promemoria di backup che non si può disattivare: dopo 30 giorni
o 10 voci nuove senza esportare, compare un avviso nella schermata iniziale.

Tre modi per salvarsi, tutti nella schermata **Backup**:

- **Backup completo (JSON)** — tutto, ripristinabile com'è.
- **Condividi su OneDrive / Drive** — apre il pannello di condivisione di Android: si
  sceglie OneDrive e la copia finisce lì.
- **Tabella per Excel (CSV)** — con separatore `;` e virgola decimale, si apre in Excel
  italiano senza passaggi. Serve per leggere, non per ripristinare.

## Ripristinare su un telefono nuovo

1. Apri l'app sul telefono nuovo (stesso indirizzo) e installala sulla Home.
2. Backup → **Scegli un file di backup** → prendi il JSON da OneDrive o da Download.
3. L'app ti mostra quante voci ci sono nel file e quante mancano, poi scegli con un
   pulsante:
   - **Sostituisci tutto con il file** → ripristino esatto (è questo che serve dopo una
     formattazione);
   - **Aggiungi le voci mancanti** → unisce senza duplicare nulla.

## Formattare il telefono

| | Sopravvive alla formattazione? |
|---|---|
| **L'app** | **Sì.** Non è sul telefono: è su internet. Basta riaprire l'indirizzo e rifare «Aggiungi alla schermata Home». |
| **I dati** | **No.** La formattazione cancella la memoria del browser. Tornano solo dal file di backup. |

Quindi la regola è una sola: **prima di formattare, esporta**. Il percorso di rientro è
sempre quello — apri l'indirizzo, installa, Backup → Importa → *Sostituisci tutto*.

Il PIN, l'ultima data di backup e le impostazioni non stanno nel file: si rifanno in un
minuto.

## Il PIN

Facoltativo. È una serratura contro chi prende in mano il telefono sbloccato, **non una
cifratura**: chi ha accesso ai dati del browser li può leggere comunque. Per questo è
importante bloccare il telefono con il PIN di sistema.

## Note tecniche

- Nessuna dipendenza esterna: niente CDN, niente font remoti, niente librerie. I grafici
  sono SVG disegnati a mano.
- Il marchio usa il carattere dell'etichetta (Bodoni MT); se il telefono non ce l'ha,
  ricade su un serif di sistema e resta leggibile.
- Verificata in Chrome headless con viewport da telefono: primo avvio con PIN, salvataggio
  con importo a virgola, rifiuto dell'importo a zero, totali, torta, colonne mensili,
  modifica, export CSV (`Data;Voce;Importo;Note`, virgola decimale) e backup JSON.
- Quando aggiorni `index.html`, cambia `VERSIONE_CACHE` in `sw.js`: è così che il telefono
  si accorge che c'è una versione nuova.

## Cosa si può aggiungere

- **Una seconda dimensione: la coltura** (pomodoro, zucchine, oliva…), per sapere quanto
  costa davvero un ortaggio e non solo quanto si spende in totale.
- **Scrittura automatica su OneDrive** (Microsoft Graph, permesso
  `Files.ReadWrite.AppFolder`, cartella `Apps/Ortu Lupiae`). Gratis, ma richiede una
  registrazione app su Microsoft Entra e un indirizzo https stabile. Con quello i dati
  sopravvivono anche allo svuotamento del browser.
- **APK installabile** partendo da questa app, senza installare nulla sul PC:
  `pwabuilder.com` impacchetta un sito https in un APK firmato.
