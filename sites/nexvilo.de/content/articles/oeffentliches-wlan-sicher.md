---
title: "Öffentliches WLAN sicher nutzen: Café, Hotel, Bahn und Flughafen ohne Risiko"
description: "Wie gefährlich offene Hotspots wirklich sind, woran du gefälschte WLANs erkennst, wann ein VPN sinnvoll ist und welche Einstellungen Smartphone und Laptop unterwegs schützen."
category: sicher-im-netz
date: 2026-10-26
order: 7
---
Im Café kurz die Mails checken, im ICE die Präsentation hochladen, im Hotel abends einen Film streamen: Kostenlose WLAN-Hotspots sind praktisch und sparen mobiles Datenvolumen. Gleichzeitig hört man immer wieder Warnungen, öffentliche Netze seien gefährlich. Wie groß ist das Risiko heute wirklich? Und was kannst du tun, um dich zu schützen? Diese Anleitung erklärt nüchtern, was in einem öffentlichen WLAN passieren kann, was nicht mehr so leicht möglich ist wie früher und mit welchen Einstellungen du unterwegs sicher bist.

## Was in einem öffentlichen WLAN passieren kann

In einem öffentlichen WLAN teilst du das Netz mit Fremden. Ein Angreifer im selben Netz oder ein Betreiber mit bösen Absichten könnte versuchen:

- **Unverschlüsselten Datenverkehr mitzulesen.** Wenn Daten ohne Verschlüsselung übertragen werden, kann jemand im selben Netz sie im Prinzip abfangen.
- **Ein gefälschtes WLAN aufzuspannen.** Ein Angreifer nennt sein Netz „Hotel_Gast“ oder „Telekom“, und Geräte verbinden sich damit, weil sie den Namen kennen. Fachleute nennen das „Evil Twin“, den bösen Zwilling.
- **Dich auf gefälschte Anmeldeseiten zu lenken**, etwa eine Seite, die angeblich für den WLAN-Zugang deine E-Mail-Adresse samt Passwort verlangt.
- **Dein Gerät direkt anzugreifen**, wenn es Freigaben für Dateien oder Drucker im Netz anbietet oder veraltete Software hat.

## Was heute besser ist als früher

Die gute Nachricht: Die allermeisten Websites und Apps verschlüsseln ihre Verbindungen heute mit **HTTPS** bzw. **TLS**. Du erkennst das an `https://` am Anfang der Adresse. Dabei ist der Inhalt der Verbindung, also Passwörter, Nachrichten und Bankdaten, für andere im WLAN nicht lesbar. Messenger wie WhatsApp und Signal verschlüsseln zusätzlich Ende-zu-Ende, Banking-Apps nutzen eigene Sicherheitsmechanismen.

Das heißt: Das Risiko, dass jemand im Café einfach dein Passwort mitliest, ist heute viel geringer als vor zehn Jahren. Ganz weg ist es aber nicht, vor allem bei gefälschten WLANs, gefälschten Anmeldeseiten und Geräten ohne Updates.

## Die wichtigsten Regeln für unterwegs

### 1. Das richtige Netz wählen

- Frag beim Personal nach dem **genauen Namen** des WLANs, im Hotel an der Rezeption, im Café an der Theke.
- Sei misstrauisch bei mehreren ähnlich klingenden Netzen, etwa „Flughafen_Free“ und „Flughafen Free WiFi“.
- Nutze in der Bahn das offizielle Netz, in den Zügen der Deutschen Bahn etwa „WIFIonICE“, und melde dich über die Startseite an, die sich automatisch öffnet.

### 2. Bei der Anmeldeseite aufpassen

Viele Hotspots zeigen beim Verbinden eine Anmeldeseite, auf der du die Nutzungsbedingungen bestätigst oder eine Zimmernummer eingibst. Das ist normal. Misstrauisch solltest du werden, wenn die Seite:

- dein **E-Mail-Passwort** oder das Passwort eines sozialen Netzwerks verlangt,
- **Kreditkartendaten** abfragt, obwohl der Zugang kostenlos sein soll,
- dich auffordert, eine **App oder ein Zertifikat** zu installieren.

Im Zweifel: Verbindung trennen und mobile Daten nutzen.

### 3. Auf HTTPS achten

Gib Passwörter und persönliche Daten nur auf Seiten mit `https://` ein. Moderne Browser warnen, wenn eine Seite nicht verschlüsselt ist. Nimm diese Warnungen ernst und klicke nicht auf „Trotzdem fortfahren“. Im Browser kannst du außerdem einen **„Nur HTTPS“-Modus** aktivieren:

- **Chrome:** *Einstellungen > Datenschutz und Sicherheit > Sicherheit > Immer sichere Verbindungen verwenden.*
- **Firefox:** *Einstellungen > Datenschutz & Sicherheit > Nur-HTTPS-Modus.*
- **Safari:** stuft Verbindungen automatisch auf HTTPS hoch, wenn möglich.

### 4. Freigaben abschalten

Dein Laptop sollte in öffentlichen Netzen für andere unsichtbar sein:

- **Windows:** Wenn du dich mit einem neuen Netz verbindest, wähle das Netzwerkprofil **„Öffentlich“**. Du kannst es später unter *Einstellungen > Netzwerk und Internet > WLAN > [Netzwerk] > Netzwerkprofiltyp* ändern. Damit sind Datei- und Druckerfreigaben deaktiviert und dein PC ist für andere nicht sichtbar.
- **Mac:** Unter *Systemeinstellungen > Allgemein > Teilen* alle Freigaben ausschalten, die du unterwegs nicht brauchst, und die Firewall unter *Netzwerk > Firewall* einschalten.
- **AirDrop und Nearby Share/Quick Share:** auf „Nur Kontakte“ oder „Aus“ stellen, damit dir Fremde keine Dateien schicken können.

### 5. Automatisches Verbinden abschalten

Smartphones und Laptops verbinden sich automatisch mit Netzen, die sie schon einmal genutzt haben. Ein Angreifer kann das ausnutzen, indem er ein Netz mit einem bekannten Namen aufspannt.

- Lösche **gespeicherte öffentliche Netze**, die du nicht mehr brauchst. Auf dem iPhone unter *Einstellungen > WLAN > Bearbeiten*, auf Android unter *Einstellungen > Netzwerk und Internet > WLAN > Gespeicherte Netzwerke*.
- Schalte bei öffentlichen Netzen **„Automatisch verbinden“** aus.
- Schalte WLAN unterwegs aus, wenn du es nicht nutzt. Das spart auch Akku.

### 6. Updates installieren

Viele Angriffe in fremden Netzen nutzen bekannte Lücken in veralteter Software. Ein Gerät mit aktuellen Updates ist deutlich schwerer anzugreifen. Installiere Updates vor einer Reise.

## Braucht man unterwegs ein VPN?

Ein **VPN** (Virtual Private Network) baut einen verschlüsselten Tunnel zwischen deinem Gerät und einem Server des VPN-Anbieters auf. Alles, was du im Internet tust, läuft durch diesen Tunnel. Für andere im öffentlichen WLAN ist nichts mehr zu sehen, nicht einmal, welche Websites du besuchst.

### Wann ein VPN sinnvoll ist

- Wenn du **häufig in öffentlichen Netzen** arbeitest, etwa auf Geschäftsreisen.
- Wenn du dich mit dem **Firmennetz** verbinden musst. Dein Arbeitgeber stellt dann meist ein eigenes VPN bereit.
- Wenn du auf dein **Heimnetz** zugreifen möchtest. Viele aktuelle Router, etwa die FRITZ!Box, bieten ein eigenes VPN per WireGuard an. Damit surfst du unterwegs über deinen eigenen Anschluss zu Hause.
- Wenn du in einem Land unterwegs bist, in dem bestimmte Dienste gesperrt sind oder überwacht werden.

### Worauf du achten solltest

- **Kostenlose VPN-Apps** sind oft problematisch. Manche finanzieren sich durch Werbung oder den Verkauf von Nutzerdaten, einige enthielten sogar Schadsoftware. Wenn ein VPN nichts kostet, ist oft dein Surfverhalten das Produkt.
- Ein VPN verschiebt das Vertrauen nur: Statt dem WLAN-Betreiber vertraust du dem VPN-Anbieter. Wähle deshalb einen bekannten Anbieter mit klarer Datenschutzerklärung, der unabhängig geprüft wurde.
- Ein VPN schützt **nicht** vor Phishing, Schadsoftware oder unsicheren Passwörtern.

**Für die meisten Menschen gilt:** Mit HTTPS, aktuellen Geräten und etwas Aufmerksamkeit bist du auch ohne VPN gut geschützt. Ein seriöses VPN ist eine sinnvolle Ergänzung für Vielreisende.

## Die Alternative: dein eigener Hotspot

Oft ist es am einfachsten und sichersten, gar kein fremdes WLAN zu nutzen. Mit dem **persönlichen Hotspot** deines Smartphones machst du dein Handy zum Router für den Laptop. Die Verbindung zwischen Laptop und Handy schützt du mit einem eigenen Passwort.

- **iPhone:** *Einstellungen > Persönlicher Hotspot.*
- **Android:** *Einstellungen > Netzwerk und Internet > Hotspot und Tethering.*

Viele Tarife enthalten inzwischen großzügiges Datenvolumen, und im EU-Ausland gilt dank „Roam like at home“ dein Inlandstarif. Außerhalb der EU, etwa in der Schweiz, Großbritannien oder der Türkei, können aber hohe Kosten entstehen. Prüfe vor der Reise die Bedingungen deines Tarifs oder kaufe eine **Reise-eSIM**.

## Besondere Vorsicht bei sensiblen Dingen

Auch wenn die Verbindungen heute meist verschlüsselt sind: Für besonders sensible Vorgänge ist das eigene Mobilfunknetz die bessere Wahl. Dazu gehören:

- **Online-Banking** und Überweisungen,
- **Änderungen von Passwörtern** und Sicherheitseinstellungen,
- **Einkäufe** mit Eingabe von Kartendaten,
- **Zugriff auf Gesundheitsdaten** oder Behördenportale.

Wenn es nicht anders geht, nutze dafür die **offizielle App** statt des Browsers und achte darauf, dass niemand auf deinen Bildschirm schaut.

## Ein Blick über die Schulter

Nicht alle Risiken sind technisch. In Cafés, Zügen und Wartehallen kann jemand einfach auf deinen Bildschirm schauen, während du ein Passwort tippst oder eine vertrauliche E-Mail liest.

- Setz dich so, dass niemand hinter dir sitzt.
- Nutze für Laptops eine **Blickschutzfolie**, wenn du oft unterwegs arbeitest.
- **Sperre den Bildschirm** (Windows + L oder auf dem Mac Strg + Befehl + Q), wenn du kurz aufstehst, auch nur für einen Moment.
- Lass Laptop und Smartphone **nie unbeaufsichtigt** liegen.

## Checkliste für unterwegs

1. Genauen Namen des WLANs beim Personal erfragen.
2. Auf der Anmeldeseite keine Passwörter oder Kartendaten eingeben.
3. Netzwerkprofil „Öffentlich“ wählen, Freigaben aus.
4. Nur Seiten mit HTTPS nutzen, Warnungen ernst nehmen.
5. Für Banking lieber mobile Daten oder den eigenen Hotspot nutzen.
6. Gespeicherte öffentliche Netze nach der Reise löschen.
7. Bildschirm sperren, wenn du aufstehst.

## Hotel-WLAN und Ferienwohnung

Im Hotel und in Ferienwohnungen nutzen viele Menschen das WLAN mehrere Tage lang, oft auch für Streaming und Arbeit. Ein paar zusätzliche Hinweise:

- **Smart-TVs** in Hotelzimmern und Ferienwohnungen: Wenn du dich dort bei Netflix, YouTube oder einem anderen Dienst anmeldest, melde dich vor der Abreise wieder ab. Viele Dienste bieten in ihren Kontoeinstellungen auch eine Funktion „Von allen Geräten abmelden“.
- **Streaming vom Smartphone** auf den Fernseher per Chromecast oder AirPlay: Prüfe, dass du wirklich mit dem Gerät in deinem Zimmer verbunden bist und nicht mit einem im Nachbarzimmer.
- **Ferienwohnungen mit privatem Router:** Hier hat der Vermieter oder der vorherige Gast womöglich Zugriff auf den Router. Behandle das Netz wie ein öffentliches WLAN.
- **Arbeitsgeräte:** Wenn du mit einem Dienstlaptop unterwegs bist, halte dich an die Vorgaben deines Arbeitgebers, die oft ein Firmen-VPN vorschreiben.

## Häufige Fragen

**Ist ein WLAN mit Passwort sicherer als ein offenes?**
Ein Passwort, das alle Gäste kennen, schützt nur begrenzt. Neuere Hotspots mit dem Verfahren „Enhanced Open“ (OWE) verschlüsseln zudem auch ohne Passwort die Verbindung jedes Geräts einzeln, und bei WPA3 kann ein Gast den Datenverkehr anderer Gäste nicht mehr einfach mitlesen. Trotzdem gelten die Regeln oben.

**Kann jemand über das WLAN auf meine Fotos zugreifen?**
Nur, wenn du Freigaben eingeschaltet hast oder dein Gerät eine ungepatchte Lücke hat. Mit aktuellem System und abgeschalteten Freigaben ist das sehr unwahrscheinlich.

**Sind Ladestationen am Flughafen gefährlich?**
Über präparierte USB-Anschlüsse könnten theoretisch Daten übertragen werden. Moderne Smartphones fragen nach, bevor sie einem angeschlossenen Gerät vertrauen. Bestätige das nicht, oder nutze dein eigenes Netzteil an der Steckdose.

## Fazit

Öffentliches WLAN ist heute weniger gefährlich als sein Ruf, weil fast alle Verbindungen verschlüsselt sind. Die wichtigsten Risiken sind gefälschte Netze, gefälschte Anmeldeseiten und veraltete Geräte. Wähle das richtige Netz, gib auf Anmeldeseiten keine Passwörter ein, schalte Freigaben ab und halte deine Geräte aktuell. Für Banking und andere sensible Dinge sind mobile Daten oder dein eigener Hotspot die sicherere Wahl, und für Vielreisende ist ein seriöses VPN eine gute Ergänzung.
