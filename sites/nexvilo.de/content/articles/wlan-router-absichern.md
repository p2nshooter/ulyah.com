---
title: "WLAN und Router absichern: Die zehn wichtigsten Einstellungen für dein Heimnetz"
description: "So schützt du dein Heimnetz: Router-Passwort ändern, WPA3 aktivieren, Gäste-WLAN einrichten, Updates einschalten, WPS und Fernzugriff prüfen und sehen, welche Geräte verbunden sind."
category: sicher-im-netz
date: 2026-10-26
order: 5
---
Der Router ist die Haustür deines digitalen Zuhauses. Über ihn laufen alle Verbindungen ins Internet: vom Smartphone, vom Laptop, vom Fernseher, von der Spielekonsole und von smarten Geräten wie Glühbirnen, Kameras oder dem Saugroboter. Wenn der Router unsicher eingestellt ist, können Fremde dein Internet mitbenutzen, deinen Datenverkehr beobachten oder Geräte in deinem Netz angreifen. Die meisten Router sind heute ab Werk deutlich besser geschützt als früher, aber ein paar Einstellungen solltest du trotzdem prüfen. Diese Anleitung zeigt dir die zehn wichtigsten, mit Beispielen für die in Deutschland verbreiteten Geräte wie die FRITZ!Box, die Speedport-Router der Telekom und die Router der Kabelanbieter.

## Vorbereitung: So kommst du in die Router-Oberfläche

Alle Einstellungen nimmst du in der **Benutzeroberfläche des Routers** vor. Du erreichst sie über den Browser eines Geräts, das mit dem WLAN oder per Kabel mit dem Router verbunden ist.

- **FRITZ!Box:** Gib `fritz.box` oder `192.168.178.1` in die Adresszeile ein.
- **Speedport (Telekom):** `speedport.ip` oder `192.168.2.1`.
- **Vodafone-Router und andere:** häufig `192.168.0.1` oder `192.168.1.1`.

Die genaue Adresse und das **Gerätepasswort** findest du meist auf einem Aufkleber an der Unterseite oder Rückseite des Routers. Viele Hersteller bieten außerdem eine App, mit der du die wichtigsten Einstellungen auf dem Smartphone erledigen kannst.

## 1. Das Router-Passwort ändern

Das Passwort für die Benutzeroberfläche schützt alle Einstellungen. Ältere Router hatten manchmal Standardpasswörter wie „admin“ oder „0000“, die im Internet für jedes Modell nachzulesen sind. Heutige Geräte haben meist ein individuelles Passwort auf dem Aufkleber. Trotzdem solltest du es ändern, wenn:

- dein Router noch ein einfaches Standardpasswort nutzt,
- andere Menschen Zugang zum Aufkleber hatten, etwa Untermieter, Handwerker oder der Vormieter, der den Router zurückgelassen hat,
- du das Passwort irgendwann einmal weitergegeben hast.

Wähle ein langes, einzigartiges Passwort und speichere es in deinem Passwortmanager. Bei der FRITZ!Box findest du die Einstellung unter *System > FRITZ!Box-Benutzer*.

## 2. Ein sicheres WLAN-Passwort und die richtige Verschlüsselung

Das WLAN-Passwort (auch „WLAN-Netzwerkschlüssel“) schützt den Zugang zu deinem Netz. Es sollte mindestens **20 Zeichen** lang sein. Der ab Werk vergebene, zufällige Schlüssel auf dem Aufkleber ist meist gut. Wenn du ihn änderst, nimm einen langen Passwortsatz.

Genauso wichtig ist die **Verschlüsselung**:

- **WPA3** ist der aktuelle Standard und am sichersten.
- **WPA2/WPA3** (Mischmodus) ist eine gute Wahl, wenn ältere Geräte im Haushalt WPA3 noch nicht unterstützen.
- **WPA2 (AES/CCMP)** ist noch akzeptabel.
- **WPA, WEP oder „offen“** sind unsicher und sollten nie verwendet werden.

Bei der FRITZ!Box findest du die Einstellung unter *WLAN > Sicherheit > Verschlüsselung*.

## 3. Updates automatisch installieren

Router sind kleine Computer mit eigener Software, der **Firmware**. Wie bei jedem Computer werden darin Sicherheitslücken entdeckt und mit Updates geschlossen. Ein Router mit veralteter Firmware ist eines der häufigsten Einfallstore für Angriffe.

- Aktiviere die **automatische Aktualisierung**. Bei der FRITZ!Box unter *System > Update > Auto-Update*, bei vielen Providergeräten ist sie bereits fest eingeschaltet.
- Prüfe gelegentlich, ob dein Router noch **unterstützt** wird. Hersteller stellen die Updates für alte Modelle irgendwann ein. Dann ist ein neues Gerät fällig.

## 4. Ein Gäste-WLAN einrichten

Ein **Gäste-WLAN** ist ein separates Netz für Besucher. Gäste kommen damit ins Internet, haben aber keinen Zugriff auf deine Computer, Drucker, Netzwerkfestplatten oder smarten Geräte. Das schützt dich, falls das Smartphone eines Gastes mit Schadsoftware infiziert ist, und erspart dir, dein Hauptpasswort weiterzugeben.

- Bei der FRITZ!Box: *WLAN > Gastzugang*. Dort kannst du einen eigenen Namen und ein eigenes Passwort vergeben und einen QR-Code ausdrucken, den Gäste nur scannen müssen.
- Bei vielen anderen Routern heißt die Funktion „Gastnetz“ oder „Gast-WLAN“.

Tipp: Das Gäste-WLAN eignet sich auch für **smarte Geräte**, die nur ins Internet müssen, etwa Steckdosen oder einen Saugroboter, die du über die Cloud des Herstellers steuerst. So sind sie von deinen Computern getrennt. Geräte, die mit anderen Geräten im Heimnetz sprechen müssen, etwa ein Drucker oder ein Medienserver, gehören dagegen ins Hauptnetz.

## 5. WPS ausschalten

**WPS** (Wi-Fi Protected Setup) ist eine Funktion, mit der Geräte per Knopfdruck ins WLAN kommen. Die Knopfdruck-Variante ist praktisch und ziemlich sicher, weil sie nur zwei Minuten aktiv ist. Die **PIN-Variante** von WPS hatte in der Vergangenheit aber Sicherheitslücken.

Empfehlung: Schalte die WPS-PIN-Methode aus. Die Knopfdruck-Methode kannst du aktiviert lassen, wenn du sie nutzt, oder ebenfalls deaktivieren und Geräte über das Passwort oder einen QR-Code verbinden.

## 6. Fernzugriff und Portfreigaben prüfen

Viele Router erlauben es, von unterwegs auf das Heimnetz zuzugreifen, etwa um die Einstellungen zu ändern oder auf eine Netzwerkfestplatte zuzugreifen. Jede solche Öffnung ist eine mögliche Angriffsfläche.

- Prüfe unter *Internet > Freigaben* (FRITZ!Box) oder ähnlichen Menüpunkten, welche **Portfreigaben** eingerichtet sind. Entferne alles, was du nicht kennst oder nicht mehr brauchst.
- Deaktiviere den **Fernzugriff aus dem Internet** auf die Router-Oberfläche, wenn du ihn nicht nutzt.
- Wenn du von unterwegs auf dein Heimnetz zugreifen möchtest, ist ein **VPN** (etwa per WireGuard, das viele aktuelle Router direkt unterstützen) deutlich sicherer als offene Ports.
- Schalte **UPnP** (automatische Portfreigaben durch Geräte) aus, wenn du es nicht brauchst. Manche Spielekonsolen und Videotelefonie-Programme nutzen UPnP; wenn danach etwas nicht mehr funktioniert, kannst du es gezielt wieder aktivieren.

## 7. Verbundene Geräte kontrollieren

Weißt du, welche Geräte gerade in deinem WLAN sind? Die Router-Oberfläche zeigt dir eine Liste aller verbundenen Geräte, bei der FRITZ!Box unter *Heimnetz > Netzwerk*.

- Gib den Geräten verständliche Namen, etwa „Laptop Anna“ oder „Fernseher Wohnzimmer“.
- Wenn du ein Gerät findest, das du nicht zuordnen kannst, prüfe zunächst, ob es zu einem smarten Gerät gehört, etwa zur Waschmaschine oder zum Saugroboter. Viele zeigen nur Hersteller-Kürzel an.
- Findest du wirklich ein fremdes Gerät, ändere das WLAN-Passwort. Dann müssen sich alle Geräte neu verbinden, und Fremde sind ausgesperrt.

## 8. Den Netzwerknamen sinnvoll wählen

Der WLAN-Name (SSID) ist für alle in der Umgebung sichtbar. Verwende keinen Namen, der verrät, wer du bist oder wo du wohnst, etwa „Familie Müller Hauptstraße 12“. Auch der Name des Routermodells, zum Beispiel „FRITZ!Box 7590“, gibt Angreifern Hinweise auf mögliche Schwachstellen. Ein neutraler Name wie „Wolkennetz“ ist besser.

Das **Verstecken** des WLAN-Namens bringt dagegen keine echte Sicherheit. Versteckte Netze sind mit einfachen Werkzeugen trotzdem auffindbar und machen das Verbinden umständlicher.

## 9. Kindersicherung und Zeitbegrenzung

Viele Router bieten eine eingebaute **Kindersicherung**. Bei der FRITZ!Box findest du sie unter *Internet > Filter*. Du kannst für einzelne Geräte Online-Zeiten festlegen, Pausen einrichten und bestimmte Seiten sperren. Das ist eine gute Ergänzung zu den Einstellungen auf dem Smartphone der Kinder, ersetzt aber nicht das Gespräch über Medienregeln. Mehr dazu in unserer Anleitung zur Bildschirmzeit in der Familie.

## 10. Die Router-Sicherung speichern

Wenn alles eingerichtet ist, speichere die Einstellungen in einer **Sicherungsdatei**. Bei der FRITZ!Box unter *System > Sicherung*. Bei einem Defekt oder nach dem Zurücksetzen spielst du die Datei einfach wieder ein und musst nicht alles neu einrichten. Vergib ein Kennwort für die Sicherungsdatei und bewahre sie an einem sicheren Ort auf.

## Checkliste: Router in 20 Minuten absichern

| Punkt | Erledigt? |
|---|---|
| Router-Passwort individuell und lang | ☐ |
| WLAN mit WPA3 oder WPA2/WPA3 | ☐ |
| WLAN-Passwort mit 20 und mehr Zeichen | ☐ |
| Automatische Updates aktiv | ☐ |
| Gäste-WLAN eingerichtet | ☐ |
| WPS-PIN deaktiviert | ☐ |
| Fernzugriff und unbekannte Portfreigaben entfernt | ☐ |
| UPnP geprüft | ☐ |
| Liste der verbundenen Geräte geprüft | ☐ |
| Neutraler WLAN-Name | ☐ |
| Sicherung der Einstellungen gespeichert | ☐ |

## Wann ein neuer Router fällig ist

Ein Router, der keine Updates mehr bekommt, sollte ersetzt werden. Anzeichen dafür sind:

- Der Hersteller listet dein Modell nicht mehr bei den aktuellen Updates.
- Der Router unterstützt kein **WPA3** und nur alte WLAN-Standards wie WLAN 4 (802.11n).
- Die Verbindung bricht häufig ab oder ist trotz guten Tarifs langsam.

Wenn du einen neuen Router kaufst, achte auf **WLAN 6 oder WLAN 7**, WPA3, regelmäßige Updates und eine Mesh-Funktion für größere Wohnungen. In Deutschland gilt die **Routerfreiheit**: Du darfst ein eigenes Gerät verwenden, statt das Gerät des Anbieters zu mieten. Die Zugangsdaten muss dir dein Anbieter mitteilen.

## Häufige Fragen

**Muss ich den Router nachts ausschalten?**
Aus Sicherheitsgründen nicht. Wenn du nachts kein WLAN möchtest, kannst du bei vielen Routern eine **Nachtschaltung** einrichten, die das WLAN zu bestimmten Zeiten automatisch abschaltet.

**Reicht der Schutz des Routers, oder brauche ich zusätzlich etwas auf den Geräten?**
Der Router schützt das Netz als Ganzes. Jedes Gerät braucht trotzdem Updates und eine sichere Sperre. Beides ergänzt sich.

**Ist mein Nachbar eine Gefahr, wenn er mein WLAN sieht?**
Nein, das Sehen des Namens ist harmlos. Mit einem sicheren Passwort und WPA2 oder WPA3 kommt er nicht hinein.

**Wer haftet, wenn jemand über mein WLAN etwas Illegales tut?**
Seit einer Gesetzesänderung haften private WLAN-Betreiber in Deutschland in der Regel nicht mehr als „Störer“ für Rechtsverletzungen Dritter. Trotzdem ist ein gesichertes WLAN der beste Schutz vor Ärger und Missbrauch.

## Fazit

Ein sicheres Heimnetz braucht keine teure Technik, sondern die richtigen Einstellungen: ein individuelles Router-Passwort, WPA3 oder WPA2 mit langem WLAN-Schlüssel, automatische Updates und ein Gäste-WLAN für Besucher und smarte Geräte. Schalte ungenutzte Funktionen wie Fernzugriff, WPS-PIN und unbekannte Portfreigaben ab, und wirf ab und zu einen Blick auf die Liste der verbundenen Geräte. In zwanzig Minuten ist dein Router so gut geschützt, dass du dir um die Haustür deines digitalen Zuhauses keine Sorgen mehr machen musst.
