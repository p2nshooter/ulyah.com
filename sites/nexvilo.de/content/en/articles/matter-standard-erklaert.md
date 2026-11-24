---
slug: matter-and-thread-simply-explained-the-common-standard-for-the-smart
title: "Matter and Thread simply explained: The common standard for the smart home"
description: What Matter and Thread are, why Apple, Google, Amazon and Samsung are participating, what devices are available, what you need as a headquarters and how to set up a Matter device step by step.
---
Anyone who has bought smart devices in the last few years knows the problem: the lamp only works with Alexa, the thermostat only works with Google, the socket needs its own app, and the motion detector doesn't talk to any of them. Each manufacturer had their own world. That's exactly what **Matter** is supposed to change. The standard was developed jointly by the largest technology companies and is intended to ensure that smart devices work together regardless of brand. This guide explains what is behind Matter and the radio standard Thread, what you need to get started and what you should pay attention to when buying.

## The problem that Matter is supposed to solve

Before Matter, when purchasing any smart device you had to check whether it was compatible with your system. The packaging had logos like “Works with Alexa,” “Works with Google Assistant,” or “Works with Apple HomeKit,” and often exactly what you needed was missing. Anyone who later wanted to change the system, for example from Android to the iPhone, had to replace many devices or live with several apps.

In addition, many devices only worked via the manufacturer's **cloud**. If the internet went down or the manufacturer stopped its service, nothing worked anymore.

## Which is matter

Matter is a **common standard**, i.e. a common language for smart devices. It was developed by the **Connectivity Standards Alliance**, a coalition of hundreds of companies including Apple, Google, Amazon, Samsung, IKEA, Philips Hue (Signify), Eve, Nanoleaf and many others.

The most important features:

- **Across manufacturers:** A Matter device works with Apple Home, Google Home, Amazon Alexa and Samsung SmartThings.
- **Multiple systems at the same time:** Thanks to “Multi-Admin”, a device can be integrated into several systems at the same time. You can control a lamp with Siri and Alexa if both are used in the household.
- **Local instead of cloud:** Matter devices communicate directly in your home network. They work even if the internet goes down. The respective system still uses the Internet for control while on the go.
- **Security:** Matter requires encryption and secure code setup. Each device has a certificate proving its authenticity.
- **Easy setup:** A QR code or numeric code on the device is enough.

## Which is thread

Language matters. However, a radio path is required to transmit data. Matter works in three ways:

1. **WLAN** for devices with high data requirements or power connections, such as sockets, lamps or cameras.
2. **Ethernet** (network cable) for control panels and permanently installed devices.
3. **Thread** for small, battery-operated devices such as sensors, window contacts or radiator thermostats.

**Thread** is a modern, very economical wireless standard. The devices form a so-called **mesh network**: devices with a power connection pass on signals so that the network becomes more stable and larger with each device. This means that battery devices last a long time, often a year or more.

In order for Thread devices to talk to your home network and the Internet, you need a **Thread border router**. This sounds complicated, but it is usually a device that you already have or would buy anyway.

## What you need as a headquarters

For Matter you need a **Matter controller**, i.e. a device that takes over the control. For Thread devices you also need a **Thread Border Router**. Often both are combined in one device:

| system | Suitable control panels (examples) |
|---|---|
| **Apple Home** | Apple TV 4K (current models), HomePod, HomePod mini |
| **Google Home** | Nest Hub (2nd Gen), Nest Hub Max, Nest Wifi Pro, Google TV Streamer |
| **Amazon Alexa** | many Echo speakers and Echo displays of newer generations |
| **Samsung SmartThings** | SmartThings Station, some Samsung TVs and refrigerators |
| **Independent** | Home Assistant with matching wireless adapter, Homey Pro, individual routers with Matter support |

You may already have many of these devices. Check your system's app or manufacturer's website to see if your device supports Matter and Thread.

**Important for iPhone users:** For automation and control on the go, Apple Home requires a control center, i.e. an Apple TV or HomePod. The iPhone alone is only enough for home control.

## Which devices are available with Matter

Matter expands with each release. These device types, among others, are now supported:

- Lamps, bulbs, light switches and dimmers
- Sockets and adapter plugs, some with consumption measurement
- Thermostats and radiator thermostats
- Door and window contacts, motion and presence detectors
- Temperature, humidity and air quality sensors
- Smoke, carbon monoxide and water detectors
- Door locks
- Roller shutter, blind and curtain controls
- Robot vacuum cleaner
- Household appliances such as washing machines, refrigerators and air conditioners
- Energy devices such as wallboxes and heat pumps, which are added in newer versions

Cameras and doorbells with video are only available in newer versions of Matter and are not yet available everywhere. Check the specific functions of such devices.

## How to recognize Matter devices

On the packaging and on the device you will find the **Matter logo**: three curved arrows that converge in one point. Thread devices often also carry the Thread logo. Also pay attention to:

- the **setup code** (QR code and eleven-digit numerical code) on the device or in the package. **Save it**, perhaps as a photo in an album or in your password manager. You will need it if you need to set up the device again.
- Notes whether the device uses **Matter over WLAN** or **Matter over Thread**.
- Older devices that become Matter-enabled via **firmware update**. Some manufacturers retrofit existing products, for example via their bridge.

## Setting up a Matter device: step by step

The process is similar for all systems:

1. **Prepare your smartphone:** Turn on Bluetooth and WiFi, open your system's app (Apple Home, Google Home, Alexa or SmartThings) and connect your smartphone to your home WiFi.
2. **Switch on the device:** Screw in the lamp, plug in the socket or insert the battery. The device automatically enters pairing mode.
3. Select **“Add Device”** in the app and select **Matter** as the device type.
4. **Scan QR code** or enter the numerical code.
5. The app connects to the device via Bluetooth and transfers the access data for WLAN or Thread.
6. **Determine the room and name**, for example “Living room – floor lamp”.
7. Complete. The device appears in the app and can be controlled and integrated into automations.

### Bring a device into a second system

If you also want to use the same device in another system, there is a function in the app of the first system such as **“Connected Services”**, **“Share with other apps”** or **“Activate pairing mode”**. It generates a new code that you enter in the second system.

## Limits and typical stumbling blocks

Matter is a big step forward, but not yet perfect:

- **Not all functions are available everywhere.** Basic functions such as on, off and dimming work everywhere, while special functions such as lighting effects or detailed energy statistics sometimes only work in the manufacturer's app.
- **Multiple thread networks:** If you have control panels from different manufacturers, separate thread networks can arise. The systems gradually learn to merge their networks. For starters, it's easier to stick with one platform as your main system.
- **Unable to add device:** Restart the smartphone and device, hold the smartphone close to the device, check if you are on 2.4GHz Wi-Fi, and reset the device to factory settings if necessary.
- **Updates:** Keep the headquarters, app and devices up to date as Matter is constantly being developed.

## Is it worth switching to Matter?

If you already have working devices, you don't need to replace them right away. Many existing systems can gradually be connected to Matter via their bridge. But for **new purchases** Matter is the best choice:

- You are no longer tied to one manufacturer or one system.
- If you change your smartphone system, your devices will continue to work.
- Local control makes the smart home faster and more independent of the Internet.
- New devices are becoming increasingly cheaper and more diverse over time.

## Example: A small Matter home in three steps

What exactly does getting started with Matter look like? An example of a two-room apartment in which an iPhone and an Android phone are used:

1. **The headquarters:** There is already a smart speaker with Thread support in the living room. It serves as a matter controller and thread border router.
2. **The first devices:** Two Matter lamps for the floor lamp and hallway, a Matter socket with consumption measurement for the television and a Thread window contact in the bedroom.
3. **You create the first automations** in the system app.

Three simple rules are enough to get you started:

- At 11 p.m., the socket switches off the television and receiver completely, thus preventing standby consumption.
- At sunset the hallway lamp turns on dimly.
- If the bedroom window is open for more than ten minutes, a reminder will appear on your cell phone.

Because all devices speak Matter, the person with the iPhone can control them in Apple Home and the person with the Android phone can control them in Google Home. If a radiator thermostat is added later, it fits into the existing thread network without an additional bridge and even makes it more stable.



## Frequently asked questions

**Do I really need a smart speaker for Matter?**
No, but a central office is necessary. This could also be an Apple TV, a Google TV device, a router with Matter support or a home assistant system.

**Do Matter devices work without internet?**
Yes, the control in the home network works locally. Without the Internet, however, control on the go and voice commands that run via the cloud are no longer necessary.

**Are Matter devices more expensive?**
Hardly anymore. Matter sockets and lamps are now available in similar price ranges as devices without Matter.

**What happens to my old Zigbee devices?**
Many manufacturers such as Philips Hue and IKEA offer bridges that integrate their Zigbee devices into other systems as Matter devices. This way you don't have to throw anything away.

## Conclusion

Matter is the common language that the major technology companies have agreed on for the smart home, and Thread is the economical radio path for small devices. Together they ensure that smart lamps, sockets, sensors and thermostats work together across brands, locally and securely. To get started, you need a control center, which is often already in your home, and devices with the Matter logo. Keep track of each device's setup code, stick to one platform to begin with, and your smart home will remain flexible even if you change smartphones at some point.
