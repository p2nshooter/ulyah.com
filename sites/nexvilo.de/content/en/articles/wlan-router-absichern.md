---
slug: securing-wifi-and-routers-the-ten-most-important-settings-for-your
title: "Securing WiFi and routers: The ten most important settings for your home network"
description: "How to protect your home network: Change router password, activate WPA3, set up guest WiFi, turn on updates, check WPS and remote access and see which devices are connected."
---
The router is the front door of your digital home. All connections to the Internet are made via it: from smartphones, laptops, televisions, games consoles and smart devices such as light bulbs, cameras or robot vacuum cleaners. If the router is set to be insecure, strangers can use your Internet, monitor your data traffic or attack devices on your network. Most routers today are much better protected from the factory than before, but you should still check a few settings. This guide shows you the ten most important ones, with examples of the devices common in Germany such as the FRITZ!Box, the Speedport routers from Telekom and the routers from the cable providers.

## Preparation: This is how you get to the router interface

You make all settings in the router's **user interface**. You can access it via the browser of a device that is connected to the WLAN or via cable to the router.

- **FRITZ!Box:** Enter `fritz.box` or `192.168.178.1` in the address line.
- **Speedport (telecom):** `speedport.ip` or `192.168.2.1`.
- **Vodafone routers and others:** often `192.168.0.1` or `192.168.1.1`.

You can usually find the exact address and the **device password** on a sticker on the bottom or back of the router. Many manufacturers also offer an app that you can use to manage the most important settings on your smartphone.

## 1. Change the router password

The user interface password protects all settings. Older routers sometimes had default passwords such as “admin” or “0000,” which can be found online for each model. Today's devices usually have an individual password on the sticker. However, you should change it if:

- your router still uses a simple standard password,
- other people had access to the sticker, such as subtenants, tradesmen or the previous tenant who left the router behind,
- you passed on the password at some point.

Choose a long, unique password and save it in your password manager. On the FRITZ!Box you can find the setting under *System > FRITZ!Box User*.

## 2. A secure WiFi password and proper encryption

The WLAN password (also “WLAN network key”) protects access to your network. It should be at least **20 characters** long. The factory-assigned, random key on the sticker is usually good. If you change it, use a long password phrase.

**Encryption** is just as important:

- **WPA3** is the current standard and most secure.
- **WPA2/WPA3** (mixed mode) is a good choice if older devices in the household do not yet support WPA3.
- **WPA2 (AES/CCMP)** is still acceptable.
- **WPA, WEP or “open”** are insecure and should never be used.

On the FRITZ!Box you can find the setting under *WLAN > Security > Encryption*.

## 3. Install updates automatically

Routers are small computers with their own software, the **firmware**. As with any computer, security gaps are discovered and closed with updates. A router with outdated firmware is one of the most common entry points for attacks.

- Enable **automatic update**. On the FRITZ!Box under *System > Update > Auto-Update*, on many provider devices it is already permanently switched on.
- Check occasionally to see if your router is still **supported**. Manufacturers will stop updating old models at some point. Then a new device is due.

## 4. Set up a guest WiFi

A **guest WiFi** is a separate network for visitors. Guests can use it to access the Internet, but have no access to your computers, printers, network hard drives or smart devices. This protects you if a guest's smartphone is infected with malware and saves you from sharing your master password.

- For the FRITZ!Box: *WLAN > Guest access*. There you can assign your own name and password and print out a QR code that guests just have to scan.
- On many other routers the function is called “guest network” or “guest WLAN”.

Tip: The guest WiFi is also suitable for **smart devices** that only need to be connected to the Internet, such as sockets or a vacuum robot, which you control via the manufacturer's cloud. This keeps them separate from your computers. Devices that need to talk to other devices in the home network, such as a printer or a media server, belong in the main network.

## 5. Turn off WPS

**WPS** (Wi-Fi Protected Setup) is a function that allows devices to join the WLAN at the push of a button. The push-button version is practical and fairly safe because it is only active for two minutes. However, the **PIN variant** of WPS has had security gaps in the past.

Recommendation: Turn off the WPS PIN method. You can leave the push-button method activated when you use it, or deactivate it and connect devices via the password or a QR code.

## 6. Check remote access and port sharing

Many routers allow you to access the home network while on the go, for example to change the settings or access a network hard drive. Every such opening is a possible target.

- Check under *Internet > Shares* (FRITZ!Box) or similar menu items which **port shares** are set up. Remove anything you don't recognize or no longer need.
- Disable **remote access from the Internet** to the router interface when you are not using it.
- If you want to access your home network while on the go, a **VPN** (e.g. via WireGuard, which many current routers directly support) is significantly more secure than open ports.
- Turn off **UPnP** (automatic port sharing by devices) if you don't need it. Some game consoles and video calling programs use UPnP; If something no longer works afterwards, you can specifically reactivate it.

## 7. Check connected devices

Do you know which devices are currently on your WiFi? The router interface shows you a list of all connected devices, in the FRITZ!Box under *Home network > Network*.

- Give the devices understandable names, such as “Laptop Anna” or “TV Living Room”.
- If you find a device that you cannot assign, first check whether it belongs to a smart device, such as a washing machine or a robot vacuum cleaner. Many only display manufacturer abbreviations.
- If you really find a strange device, change the WiFi password. Then all devices have to reconnect and strangers are locked out.

## 8. Choose the network name sensibly

The WiFi name (SSID) is visible to everyone in the area. Do not use a name that reveals who you are or where you live, such as “Family Müller Hauptstraße 12”. The name of the router model, for example “FRITZ!Box 7590”, also gives attackers information about possible vulnerabilities. A neutral name like “cloud network” is better.

However, **hiding** the WLAN name does not provide any real security. Hidden networks can still be found with simple tools and make connecting more complicated.

## 9. Parental controls and time limits

Many routers offer built-in **parental controls**. With the FRITZ!Box you can find it under *Internet > Filter*. You can set online times for individual devices, set up breaks and block certain pages. This is a good addition to the settings on the children's smartphone, but does not replace the conversation about media rules. For more information, see our guide to family screen time.

## 10. Save the router backup

Once everything is set up, save the settings to a **backup file**. On the FRITZ!Box under *System > Backup*. If there is a defect or after a reset, you can simply import the file again and you don't have to set everything up again. Give the backup file a password and store it in a safe place.

## Checklist: Secure your router in 20 minutes

| Period | Done? |
|---|---|
| Router password individual and long | ☐ |
| WLAN with WPA3 or WPA2/WPA3 | ☐ |
| WiFi password with 20 or more characters | ☐ |
| Automatic updates active | ☐ |
| Guest WiFi set up | ☐ |
| WPS PIN disabled | ☐ |
| Remote access and unknown port sharing removed | ☐ |
| UPnP checked | ☐ |
| List of connected devices checked | ☐ |
| Neutral WiFi name | ☐ |
| Backup of settings saved | ☐ |

## When a new router is due

A router that no longer receives updates should be replaced. Signs of this are:

- The manufacturer no longer lists your model in the current updates.
- The router does not support **WPA3** and only old WLAN standards such as WLAN 4 (802.11n).
- The connection often drops or is slow despite a good tariff.

When buying a new router, look for **Wi-Fi 6 or Wi-Fi 7**, WPA3, regular updates and a mesh function for larger apartments. In Germany, **router freedom** applies: you can use your own device instead of renting the provider's device. Your provider must provide you with the access data.

## Frequently asked questions

**Do I have to turn off the router at night?**
Not for security reasons. If you don't want WiFi at night, you can set up a **night switch** on many routers, which automatically switches off the WiFi at certain times.

**Is the protection of the router enough, or do I need something additional on the devices?**
The router protects the network as a whole. Every device still needs updates and a secure lock. Both complement each other.

**Is my neighbor a danger if they see my WiFi?**
No, seeing the name is harmless. With a secure password and WPA2 or WPA3 it won't get in.

**Who is liable if someone does something illegal over my WiFi?**
Since a change in the law, private WLAN operators in Germany are generally no longer liable as “troublemakers” for legal violations by third parties. Nevertheless, a secured WLAN is the best protection against trouble and misuse.

## Conclusion

A secure home network does not require expensive technology, but rather the right settings: an individual router password, WPA3 or WPA2 with a long WLAN key, automatic updates and a guest WLAN for visitors and smart devices. Turn off unused features like remote access, WPS PIN, and unknown port sharing, and take a look at the list of connected devices from time to time. In twenty minutes, your router will be so well protected that you no longer have to worry about the front door of your digital home.
