---
slug: understanding-windows-updates-what-they-are-why-they-are-important
title: "Understanding Windows updates: What they are, why they are important and what helps with problems"
description: "Security updates, feature updates, optional updates and drivers: This is how Windows Update works, how you schedule restarts and what you do if an update hangs or causes problems."
---
"Updates are being installed. Do not turn off the computer." This message often appears when you are in a hurry. It's no wonder that many people find Windows updates annoying and put them off for as long as possible. Updates are one of the most important protective measures for your computer. This guide explains what types of updates there are, how to set them up so they don't bother you, and what to do if an update hangs or causes problems.

## Why updates are so important

Software is never error-free. Security researchers, as well as criminals, repeatedly discover gaps in Windows, in the browser or in programs. Attackers can use such gaps to inject malware, steal data or encrypt your computer and demand a ransom. Microsoft closes known gaps with updates. If you don't install it, you'll leave the door open even though the lock has long since been delivered.

By the way, many attacks use gaps for which an update has been available for weeks or months. They are specifically aimed at computers that have not been updated. Installing updates is like locking the front door: it doesn't protect you from everything, but it protects you from a lot.

In addition to security, updates also bring **bug fixes**, better **compatibility** with new devices and programs, and occasionally **new features**.

## The different types of Windows updates

Different types of updates appear under *Settings > Windows Update*. It helps to tell them apart.

### Monthly quality and security updates

On the second Tuesday of every month, Microsoft releases a major security update, often called “Patch Day.” It contains all security fixes for the month. You should **always install these updates promptly**. In the list they are usually called “Cumulative Update for Windows 11” with a version number and an identifier like KB5….

### Funktionsupdates

Once a year, usually in autumn, a major function update is released, such as “Windows 11, Version 25H2”. It brings new features and improvements. Each version is provided with security updates for around two years for private users. You then have to switch to a newer version, which Windows Update usually offers automatically.

Feature updates are larger, take longer, and require multiple restarts. It's okay to wait a few weeks until bugs are fixed, as long as your version is still supported.

### Optionale Updates

Under *Advanced options > Optional updates* you can find driver updates and preview updates. Driver updates are useful if a device is not working properly, such as the WLAN or the printer. Preview updates contain bug fixes that won't come to everyone until next month. If everything is going well, you can skip them.

### Updates for Microsoft programs

If you enable the “Get updates for other Microsoft products” option under *Advanced Options*, Office and other Microsoft programs will also be updated through Windows Update. Das ist empfehlenswert.

### Antivirus definition updates

Microsoft Defender loads new virus signatures several times a day. They sometimes appear in the update list as “Security Intelligence Update” and install without rebooting.

## Set up updates so that they don't interfere

### Nutzungszeit festlegen

Windows doesn't restart for updates while you're normally using the PC. Under *Windows Update > Advanced Options > Usage Time* you can set when you sit at the computer, for example from 8 a.m. to 10 p.m. Alternatively, Windows automatically adjusts the time to suit your habits.

### Neustart planen

If an update requires a restart, Windows Update displays the message “Restart required”. Instead of restarting immediately, you can choose a time, such as in the evening. Also, turn on “Notify me when a restart is required” so you don’t get caught by surprise.

### Updates pausieren

If something important is coming up, a deadline, a trip or an important presentation, you can **pause updates for up to five weeks**. After that, you'll need to install it before you can pause again. Don't use the break as a permanent state.

### Get the latest updates instantly

The “Get the latest updates as soon as they are available” option brings new features to your computer faster. It is not necessary for security, the security updates will come anyway.

## Installing an update: step by step

1. Open *Start > Settings > Windows Update.*
2. Click **Check for updates**.
3. If you see updates, click **Download and install all** or **Restart now** if they are already downloaded.
4. Before restarting, save all open files.
5. Leave the laptop plugged in until the process is complete.

For laptops: **Do not close or turn off** while “Installing Updates” is displayed. An interrupted update can damage Windows.

## Wenn ein Update hängt

Sometimes an update seems to take forever. Before you intervene, wait patiently: feature updates can take an hour or more on older computers. But if the progress remains at the same number for several hours, the following helps:

### Im laufenden Windows

1. **Restart:** Start the computer via *Start > On/Off > Restart* and try again.
2. **Troubleshooting:** There is a troubleshooter for Windows Update in *Settings > System > Troubleshooting > Other Troubleshooters*. It resets update components.
3. **Check disk space:** Windows often requires 20 GB or more of free space for feature updates.
4. **Disconnect external devices:** USB sticks, external hard drives and card readers can interfere with updates.
5. **Temporarily disable third-party antivirus** if you use one.

### If Windows no longer starts

If the computer no longer boots properly after an update, Windows automatically starts the **Windows recovery environment** after several failed attempts. There you can uninstall the latest update, perform a system restore or use Startup Repair under *Troubleshoot > Advanced options*.

## Undo an update

If something no longer works after an update, such as a printer or a program, you can uninstall it:

1. Open *Settings > Windows Update > Update History.*
2. Scroll down to **Uninstall updates**.
3. Select the most recently installed update and click **Uninstall**.

After a feature update, you can revert to the previous version within ten days: *Settings > System > Recovery > Back.* After that, Windows deletes the old files to save space.

Only uninstall security updates if there is a serious problem, and reinstall them once Microsoft has fixed the problem. An updated driver from the manufacturer of the affected device often helps.

## Not just Windows: update other programs

Windows Update doesn't take care of all programs. Browsers like Chrome and Firefox usually update themselves, as do many other applications. Nevertheless, check regularly:

- **Browser:** You can see whether the latest version is installed in the settings under “About Chrome” or “About Firefox”.
- **PDF programs, messengers, video conference apps:** usually have their own update function.
- **Microsoft Store:** You update apps from the store in the Store app under “Downloads” or “Library”.
- **winget:** Advanced users can update many programs at once using the `winget upgrade --all` command in the command prompt.

Uninstall programs that you no longer use so you don't have to keep them up to date.

## When your Windows version reaches the end

Each version of Windows only receives security updates for a limited time. Windows 10 reached its regular end of support in October 2025, and the Extended Security Updates program for consumers expired in October 2026. If you're still using Windows 10, you should act now. We explain what options you have in our own guide to the end of support for Windows 10.

With Windows 11 you also have to make sure that you are using a supported version. You can see which version is installed under *Settings > System > Info* under “Windows specifications”.

## Good habits around updates

With a few habits, updates become a minor matter:

1. **Don't just close it in the evening.** If you restart your laptop properly once a week in the evening, you give Windows the opportunity to install pending updates in peace.
2. **Back up before major function updates.** Before the annual new version is installed, it is worth backing up your files to an external hard drive or in the cloud. Most of the time everything goes well, but a backup costs little and saves a lot of trouble in an emergency.
3. **Don't panic on Patch Day.** When a lot of people complain about problems on the second Tuesday of the month, it usually affects certain devices or programs. If in doubt, read up on whether your device is affected instead of generally avoiding updates.
4. **Drivers from the manufacturer.** If graphics, sound or WLAN cause problems after an update, the latest driver from the laptop manufacturer's support page often helps. Many manufacturers offer their own help programs for this, such as Lenovo Vantage, HP Support Assistant or MyASUS.
5. **Don't forget the older family computers.** The laptop in the guest room or the grandparents' PC is often not turned on for months. Turn it on when you visit, run updates and check whether the Windows version is still supported.

## Frequently asked questions

**Can I turn off updates permanently?**
Not completely under Windows 11 Home, and that's a good thing. It is possible to take a break for up to five weeks. Anyone who permanently blocks updates using tricks makes the computer vulnerable.

**Why does my computer take so long to start after the update?**
After major updates, Windows optimizes files in the background and rebuilds the search index. This returns to normal after a day or two.

**Are fake update messages in the browser dangerous?**
Yes. Real Windows updates never come via a website. If a browser window says you need to download an update or your PC is infected, close it. There is often malware or fraud behind this.

**Do updates use a lot of data volume?**
Feature updates can be several gigabytes in size. If you are surfing via the mobile phone network, mark the connection under *Network and Internet* as “metered connection”. Then Windows only loads major updates in the WLAN.

## Conclusion

Windows updates are not a nuisance, but rather one of the most important protective measures for your computer. You should always install monthly security updates promptly; for major function updates you can wait a few weeks. With a set usage time and scheduled restarts, updates hardly bother you anymore. And if something goes wrong, restarting, troubleshooting and the option to undo an update help.
