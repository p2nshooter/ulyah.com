---
slug: windows-11-slow-here-s-how-to-make-your-pc-run-fast-again-without
title: "Windows 11 slow? Here's how to make your PC run fast again without breaking anything"
description: "If Windows 11 is slow: clean up autostart, free up memory, check updates and drivers, rule out malware and recognize when an SSD or more RAM really helps."
---
The computer takes what feels like an eternity to start up in the morning, the browser stutters, and every program opens with a delay. A slow PC costs nerves and time, and a new device often seems to be the only solution. But that is rarely the case. In most cases, Windows 11 can be significantly accelerated using on-board tools. This guide goes through the causes one by one, from quick fixes to upgrades that are really worth it. You don't need any additional programs for this, and none of the measures endanger your data.

## First: What exactly is slow?

Before you get started, notice when the computer is slow. This narrows down the cause:

- **Only at startup:** There are usually too many programs in the autostart.
- **Always, even for simple tasks:** Often the memory is full, the hard drive is old or the RAM is too tight.
- **Browser only:** Too many tabs or extensions.
- **Suddenly, for a few days:** An update is running in the background, a new program is slowing down or there is malware in the game.
- **In hot weather or after long use:** The fan is dusty and the processor slows down to avoid overheating.

## Step 1: Query the task manager

The task manager shows you what is currently busy on the computer. Open it with **Ctrl + Shift + Esc**.

In the **Processes** area you can see which programs use how much processor (CPU), memory, data storage medium and network. Click a column heading to sort by it. If a program consistently shows high scores even though you're not using it, it's a candidate to close or uninstall.

In the **Performance** area you can see the utilization over time. Two values are important:

- **RAM:** If it is constantly above 80 to 90 percent, there is not enough RAM installed or too much is open.
- **Disk:** If it often shows 100 percent, the hard drive is the bottleneck. This is typical for old hard drives with spinning disks.

## Step 2: Clean up the startup

During installation, many programs are set up so that they run every time Windows starts: messengers, cloud services, printer utilities, updaters, gaming platforms. Each one costs startup time and memory.

1. Open *Settings > Apps > Startup* or the **Autostart apps** section in Task Manager.
2. For each program it says how much it influences the start: low, medium or high.
3. Turn off everything you don't need right after booting up.

Keep enabled: your antivirus (if you use one in addition to Windows protection), driver utilities for touchpad or audio, and your cloud storage if you want it to sync automatically. You can usually switch off everything else and start it yourself if necessary. Autostart entries that are switched off are not uninstalled, they just no longer start automatically.

## Step 3: Free up storage space

If the C: drive has less than about 15 to 20 percent free, Windows will slow down and updates may fail.

### Use memory optimization

1. Open *Settings > System > Storage.*
2. Turn on **Memory Optimization**. It automatically deletes temporary files and empties the trash after a set time.
3. Click **Cleanup Recommendations**. Windows suggests large, unused files, old downloads, and unused apps.
4. Under **Temporary Files** you can delete additional categories such as Windows Update Cleanup or Thumbnails.

Be careful with the “Downloads” category: check beforehand whether there are files there that you still need.

### Uninstall programs

You can find all programs under *Settings > Apps > Installed Apps*. Sort by size or install date and remove what you don't use, such as pre-installed trials, old games, or duplicate programs.

## Step 4: Clean up the browser

For many people, the browser is the most important program, and it is often the biggest obstacle. Every open tab takes up memory, extensions are constantly running in the background.

- **Close tabs** you don't need or save as bookmarks.
- **Check extensions:** Remove anything you don't know or don't use. Unknown extensions are also a security risk.
- **Use efficiency mode:** Microsoft Edge has an efficiency mode, Chrome has a memory saver mode. Both put inactive tabs to sleep.
- **Keep your browser up to date** and occasionally clear the cache if pages load incorrectly.

## Step 5: Updates and Drivers

It sounds paradoxical, but updates often make a computer faster and more stable because they fix errors. Check under *Settings > Windows Update* whether everything is installed. Under *Advanced Options > Optional Updates* you can sometimes find driver updates for graphics, WLAN or chipset.

After a major feature update, Windows may work in the background for a few days, for example to re-index the search. This normalizes itself.

For the **graphics card**, it's worth taking a look at the manufacturer's website (NVIDIA, AMD or Intel) when playing games or video editing. For normal office work, the drivers via Windows Update are sufficient.

## Step 6: Rule out malware

A suddenly slow computer can be an indication of malware, for example if an unknown process constantly uses up computing power or the browser opens advertising pages on its own.

1. Open the **Windows Security** app.
2. Select *Virus & Threat Protection > Scan Options* and start a **full scan**.
3. If you have persistent suspicions, also run the **Microsoft Defender offline scan**. The computer restarts and checks before Windows loads.

Do not install “PC accelerators” or “registry cleaners”. They promise miracles, usually do nothing, often show advertisements and can even damage Windows. The built-in Microsoft Defender is sufficient virus protection for most private users.

## Step 7: Power Settings and Optics

### Power mode

You can select **Energy mode** under *Settings > System > Power and battery* (or *Power and battery*). “Best performance” makes the computer noticeably faster, especially with laptops connected to the mains, but uses more energy. When running on battery power, “Balanced” is a good compromise.

### Visual effects

Animations and transparency effects look nice, but cost performance on older computers.

1. Press **Windows Key + R**, enter `sysdm.cpl` and confirm.
2. Select the *Advanced* tab, then *Settings* under Performance.
3. Select “Adjust for optimal performance” or specifically uncheck animations.

You can also turn off transparency and animations under *Settings > Accessibility > Visual Effects*.

## Step 8: Check and clean hardware

For laptops that have been in use for several years, **dust** is an often overlooked cause. If ventilation slots become blocked, the processor becomes hot and reduces its performance. Signs include a constantly loud fan and a hot case.

- To work, place the laptop on a firm, smooth surface, not on blankets or pillows.
- Carefully clean the vents with canned compressed air when the device is turned off. Hold the fan firmly so that it doesn't overspeed.
- If it is very dirty or you don't have the courage, a specialist workshop can help.

## Step 9: Upgrade if it's worth it

If your computer is still slow after all these steps, it is usually due to the hardware. Two upgrades are particularly beneficial:

### SSD instead of hard drive

If your computer still has a classic hard drive (HDD), switching to an **SSD** is the most effective improvement of all. Windows then starts in seconds instead of minutes, and programs open immediately. You can see whether you have an HDD in the task manager under *Performance > Disk*: It says “HDD” or “SSD”.

An SSD with 500 GB to 1 TB doesn't cost much these days. For many desktop PCs and older laptops, you can install it yourself or in a workshop; the system can be transferred using a cloning program.

### More RAM

For Windows 11, 8 GB of RAM is the minimum for smooth work with the browser and Office, 16 GB is comfortable. Whether RAM can be retrofitted depends on the device: in desktop PCs, the memory is almost always soldered in, and in many thin laptops. You can find the information in the manual or on the manufacturer's website.

| Initial situation | Likely effect |
|---|---|
| HDD → SSD | very large, especially when starting and opening programs |
| 4GB → 8GB RAM | large, Windows 11 hardly runs properly with 4 GB |
| 8GB → 16GB RAM | noticeable with many tabs and simultaneous programs |
| new processor | usually only possible with desktop PCs and rarely economical |

## Step 10: Last Resort – Reset Windows

If nothing helps and the computer has “grown” with programs over the years, a fresh start may make sense. Under *Settings > System > Recovery > Reset PC* you can reinstall Windows and choose whether you want to keep your personal files.

**Be sure to do this beforehand:** Back up all important files to an external hard drive or in the cloud, write down license keys and access data for programs that you need to reinstall. Programs and settings will be lost when you reset, even if you keep the files.

## Your plan in ten minutes

1. Open Task Manager and see what is slowing you down.
2. Clean up autostart.
3. Turn on storage optimization and use cleanup recommendations.
4. Remove unused programs and browser extensions.
5. Check Windows Update.
6. Perform a quick scan with Windows Security.
7. Restart.

By the way, a real restart often works wonders: If you just close your laptop for weeks, you should restart it regularly via *Start > On/Off > Restart*.

## Frequently asked questions

**Does defragmenting the hard drive help?**
With classic hard drives, Windows does this automatically on a schedule. With SSDs, defragmentation is unnecessary; Instead, Windows performs a so-called TRIM optimization. You don't have to do anything here yourself.

**Does a second antivirus make your PC safer?**
No, rather slower. Two virus scanners at the same time hinder each other. Choose the built-in Microsoft Defender or a single program from a well-known manufacturer.

**Is my PC too old for Windows 11?**
Windows 11 requires, among other things, a relatively new processor and a security module called TPM 2.0. Older computers that only run Windows 11 using tricks don't always receive updates reliably. A slim Linux or a new device may be a better choice here.



## Conclusion

A slow Windows 11 PC is rarely a case of electronic waste. Too many auto-start programs, full memory, a cluttered browser or pending updates usually slow things down. With the on-board tools from Windows and without dubious optimization programs, you can fix most causes in half an hour. If hardware is the bottleneck, an SSD and more RAM often do more than a new computer and only cost a fraction of it.
