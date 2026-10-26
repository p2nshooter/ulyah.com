---
title: "Matter und Thread einfach erklärt: Der gemeinsame Standard fürs Smart Home"
description: "Was Matter und Thread sind, warum Apple, Google, Amazon und Samsung mitmachen, welche Geräte es gibt, was du als Zentrale brauchst und wie du ein Matter-Gerät Schritt für Schritt einrichtest."
category: smart-home
date: 2026-10-26
order: 2
---
Wer in den letzten Jahren smarte Geräte gekauft hat, kennt das Problem: Die Lampe funktioniert nur mit Alexa, das Thermostat nur mit Google, die Steckdose braucht eine eigene App, und der Bewegungsmelder spricht mit keinem davon. Jeder Hersteller hatte seine eigene Welt. Genau das soll **Matter** ändern. Der Standard wurde von den größten Technikunternehmen gemeinsam entwickelt und soll dafür sorgen, dass smarte Geräte unabhängig von der Marke zusammenarbeiten. Diese Anleitung erklärt, was hinter Matter und dem Funkstandard Thread steckt, was du für den Einstieg brauchst und worauf du beim Kauf achten solltest.

## Das Problem, das Matter lösen soll

Vor Matter musste man beim Kauf jedes smarten Geräts prüfen, ob es mit dem eigenen System kompatibel ist. Auf den Verpackungen standen Logos wie „Works with Alexa“, „Works with Google Assistant“ oder „Works with Apple HomeKit“, und oft fehlte genau das, was man brauchte. Wer später das System wechseln wollte, etwa von Android zum iPhone, musste viele Geräte ersetzen oder mit mehreren Apps leben.

Hinzu kam, dass viele Geräte nur über die **Cloud** des Herstellers funktionierten. Wenn das Internet ausfiel oder der Hersteller seinen Dienst einstellte, ging nichts mehr.

## Was Matter ist

Matter ist ein **gemeinsamer Standard**, also eine gemeinsame Sprache für smarte Geräte. Entwickelt wurde er von der **Connectivity Standards Alliance**, einem Zusammenschluss von Hunderten Unternehmen, darunter Apple, Google, Amazon, Samsung, IKEA, Philips Hue (Signify), Eve, Nanoleaf und viele andere.

Die wichtigsten Eigenschaften:

- **Herstellerübergreifend:** Ein Matter-Gerät funktioniert mit Apple Home, Google Home, Amazon Alexa und Samsung SmartThings.
- **Mehrere Systeme gleichzeitig:** Dank „Multi-Admin“ kann ein Gerät gleichzeitig in mehreren Systemen eingebunden sein. Du kannst eine Lampe also mit Siri und Alexa steuern, wenn im Haushalt beide genutzt werden.
- **Lokal statt Cloud:** Matter-Geräte kommunizieren direkt in deinem Heimnetz. Sie funktionieren auch, wenn das Internet ausfällt. Für die Steuerung von unterwegs nutzt das jeweilige System trotzdem das Internet.
- **Sicherheit:** Matter verlangt Verschlüsselung und eine sichere Einrichtung per Code. Jedes Gerät hat ein Zertifikat, das seine Echtheit belegt.
- **Einfache Einrichtung:** Ein QR-Code oder ein Zahlencode auf dem Gerät reicht.

## Was Thread ist

Matter ist die Sprache. Um Daten zu übertragen, braucht es aber einen Funkweg. Matter funktioniert über drei Wege:

1. **WLAN** für Geräte mit hohem Datenbedarf oder Stromanschluss, etwa Steckdosen, Lampen oder Kameras.
2. **Ethernet** (Netzwerkkabel) für Zentralen und fest installierte Geräte.
3. **Thread** für kleine, batteriebetriebene Geräte wie Sensoren, Fensterkontakte oder Heizkörperthermostate.

**Thread** ist ein moderner, sehr sparsamer Funkstandard. Die Geräte bilden ein sogenanntes **Mesh-Netz**: Geräte mit Stromanschluss geben Signale weiter, sodass das Netz mit jedem Gerät stabiler und größer wird. Batteriegeräte halten dadurch lange durch, oft ein Jahr oder mehr.

Damit Thread-Geräte mit deinem Heimnetz und dem Internet sprechen können, brauchst du einen **Thread-Border-Router**. Das klingt kompliziert, ist aber meist ein Gerät, das du schon hast oder ohnehin kaufen würdest.

## Was du als Zentrale brauchst

Für Matter brauchst du einen **Matter-Controller**, also ein Gerät, das die Steuerung übernimmt. Für Thread-Geräte brauchst du zusätzlich einen **Thread-Border-Router**. Oft ist beides in einem Gerät vereint:

| System | Geeignete Zentralen (Beispiele) |
|---|---|
| **Apple Home** | Apple TV 4K (aktuelle Modelle), HomePod, HomePod mini |
| **Google Home** | Nest Hub (2. Generation), Nest Hub Max, Nest Wifi Pro, Google TV Streamer |
| **Amazon Alexa** | viele Echo-Lautsprecher und Echo-Displays neuerer Generationen |
| **Samsung SmartThings** | SmartThings Station, einige Samsung-Fernseher und Kühlschränke |
| **Unabhängig** | Home Assistant mit passendem Funkadapter, Homey Pro, einzelne Router mit Matter-Unterstützung |

Viele dieser Geräte hast du vielleicht schon. Prüfe in der App deines Systems oder auf der Website des Herstellers, ob dein Gerät Matter und Thread unterstützt.

**Wichtig für iPhone-Nutzer:** Für Automatisierungen und die Steuerung von unterwegs braucht Apple Home eine Steuerzentrale, also einen Apple TV oder HomePod. Das iPhone allein reicht nur für die Steuerung zu Hause.

## Welche Geräte es mit Matter gibt

Matter wird mit jeder Version erweitert. Inzwischen werden unter anderem diese Gerätetypen unterstützt:

- Lampen, Leuchtmittel, Lichtschalter und Dimmer
- Steckdosen und Zwischenstecker, teilweise mit Verbrauchsmessung
- Thermostate und Heizkörperthermostate
- Tür- und Fensterkontakte, Bewegungs- und Präsenzmelder
- Temperatur-, Feuchtigkeits- und Luftqualitätssensoren
- Rauch-, Kohlenmonoxid- und Wassermelder
- Türschlösser
- Rollladen-, Jalousie- und Vorhangsteuerungen
- Saugroboter
- Haushaltsgeräte wie Waschmaschinen, Kühlschränke und Klimageräte
- Energiegeräte wie Wallboxen und Wärmepumpen, die in neueren Versionen hinzukommen

Kameras und Türklingeln mit Video sind in Matter erst in neueren Versionen vorgesehen und noch nicht überall verfügbar. Prüfe bei solchen Geräten die konkreten Funktionen.

## Woran du Matter-Geräte erkennst

Auf der Verpackung und am Gerät findest du das **Matter-Logo**: drei geschwungene Pfeile, die in einem Punkt zusammenlaufen. Thread-Geräte tragen zusätzlich oft das Thread-Logo. Achte außerdem auf:

- den **Einrichtungscode** (QR-Code und elfstelliger Zahlencode) am Gerät oder in der Packung. **Bewahre ihn auf**, etwa als Foto in einem Album oder in deinem Passwortmanager. Du brauchst ihn, wenn du das Gerät neu einrichten musst.
- Hinweise, ob das Gerät **Matter über WLAN** oder **Matter über Thread** nutzt.
- Ältere Geräte, die per **Firmware-Update** Matter-fähig werden. Manche Hersteller rüsten bestehende Produkte nach, etwa über ihre Bridge.

## Ein Matter-Gerät einrichten: Schritt für Schritt

Der Ablauf ist bei allen Systemen ähnlich:

1. **Smartphone vorbereiten:** Bluetooth und WLAN einschalten, die App deines Systems öffnen (Apple Home, Google Home, Alexa oder SmartThings) und das Smartphone mit dem Heim-WLAN verbinden.
2. **Gerät einschalten:** Lampe einschrauben, Steckdose einstecken oder Batterie einlegen. Das Gerät geht automatisch in den Kopplungsmodus.
3. **„Gerät hinzufügen“** in der App wählen und **Matter** als Gerätetyp auswählen.
4. **QR-Code scannen** oder den Zahlencode eingeben.
5. Die App verbindet sich per Bluetooth mit dem Gerät und überträgt die Zugangsdaten für WLAN oder Thread.
6. **Raum und Name** festlegen, etwa „Wohnzimmer – Stehlampe“.
7. Fertig. Das Gerät erscheint in der App und lässt sich steuern und in Automatisierungen einbinden.

### Ein Gerät in ein zweites System holen

Wenn du dasselbe Gerät zusätzlich in einem anderen System nutzen möchtest, gibt es in der App des ersten Systems eine Funktion wie **„Verbundene Dienste“**, **„Mit anderen Apps teilen“** oder **„Kopplungsmodus aktivieren“**. Sie erzeugt einen neuen Code, den du im zweiten System eingibst.

## Grenzen und typische Stolpersteine

Matter ist ein großer Fortschritt, aber noch nicht perfekt:

- **Nicht alle Funktionen sind überall verfügbar.** Grundfunktionen wie Ein, Aus und Dimmen funktionieren überall, spezielle Funktionen wie Lichteffekte oder detaillierte Energiestatistiken manchmal nur in der App des Herstellers.
- **Mehrere Thread-Netze:** Wenn du Zentralen verschiedener Hersteller hast, können getrennte Thread-Netze entstehen. Die Systeme lernen nach und nach, ihre Netze zusammenzuführen. Für den Anfang ist es einfacher, bei einer Plattform als Hauptsystem zu bleiben.
- **Gerät lässt sich nicht hinzufügen:** Starte Smartphone und Gerät neu, halte das Smartphone nahe an das Gerät, prüfe, ob du im 2,4-GHz-WLAN bist, und setze das Gerät bei Bedarf auf Werkseinstellungen zurück.
- **Updates:** Halte Zentrale, App und Geräte aktuell, denn Matter wird laufend weiterentwickelt.

## Lohnt sich der Umstieg auf Matter?

Wenn du bereits funktionierende Geräte hast, musst du sie nicht sofort ersetzen. Viele bestehende Systeme lassen sich über ihre Bridge nach und nach mit Matter verbinden. Für **Neukäufe** ist Matter aber die beste Wahl:

- Du bist nicht mehr an einen Hersteller oder ein System gebunden.
- Wenn du das Smartphone-System wechselst, funktionieren deine Geräte weiter.
- Die lokale Steuerung macht das Smart Home schneller und unabhängiger vom Internet.
- Neue Geräte werden mit der Zeit immer günstiger und vielfältiger.

## Beispiel: Ein kleines Matter-Zuhause in drei Schritten

Wie sieht ein Einstieg mit Matter konkret aus? Ein Beispiel für eine Zwei-Zimmer-Wohnung, in der ein iPhone und ein Android-Handy genutzt werden:

1. **Die Zentrale:** Im Wohnzimmer steht bereits ein smarter Lautsprecher mit Thread-Unterstützung. Er dient als Matter-Controller und Thread-Border-Router.
2. **Die ersten Geräte:** Zwei Matter-Leuchtmittel für Stehlampe und Flur, eine Matter-Steckdose mit Verbrauchsmessung für den Fernseher und ein Thread-Fensterkontakt im Schlafzimmer.
3. **Die ersten Automatisierungen** legst du in der App des Systems an.

Drei einfache Regeln reichen für den Anfang:

- Um 23 Uhr schaltet die Steckdose den Fernseher samt Receiver vollständig ab und verhindert so Standby-Verbrauch.
- Bei Sonnenuntergang geht die Flurlampe gedimmt an.
- Wenn das Schlafzimmerfenster länger als zehn Minuten offen ist, kommt eine Erinnerung aufs Handy.

Weil alle Geräte Matter sprechen, kann die Person mit dem iPhone sie in Apple Home steuern und die Person mit dem Android-Handy in Google Home. Kommt später ein Heizkörperthermostat hinzu, passt es ohne weitere Bridge ins bestehende Thread-Netz und macht es dabei sogar stabiler.



**Brauche ich für Matter unbedingt einen smarten Lautsprecher?**
Nein, aber eine Zentrale ist nötig. Das kann auch ein Apple TV, ein Google-TV-Gerät, ein Router mit Matter-Unterstützung oder ein Home-Assistant-System sein.

**Funktionieren Matter-Geräte ohne Internet?**
Ja, die Steuerung im Heimnetz funktioniert lokal. Ohne Internet entfallen aber die Steuerung von unterwegs und Sprachbefehle, die über die Cloud laufen.

**Sind Matter-Geräte teurer?**
Kaum noch. Matter-Steckdosen und -Lampen sind inzwischen in ähnlichen Preisklassen erhältlich wie Geräte ohne Matter.

**Was passiert mit meinen alten Zigbee-Geräten?**
Viele Hersteller wie Philips Hue und IKEA bieten Bridges an, die ihre Zigbee-Geräte als Matter-Geräte in andere Systeme einbinden. So musst du nichts wegwerfen.

## Fazit

Matter ist die gemeinsame Sprache, auf die sich die großen Technikkonzerne für das Smart Home geeinigt haben, und Thread ist der sparsame Funkweg für kleine Geräte. Zusammen sorgen sie dafür, dass smarte Lampen, Steckdosen, Sensoren und Thermostate markenübergreifend, lokal und sicher zusammenarbeiten. Für den Einstieg brauchst du eine Zentrale, die oft schon im Haushalt steht, und Geräte mit dem Matter-Logo. Bewahre den Einrichtungscode jedes Geräts auf, bleib am Anfang bei einer Plattform, und dein Smart Home bleibt flexibel, auch wenn du irgendwann das Smartphone wechselst.
