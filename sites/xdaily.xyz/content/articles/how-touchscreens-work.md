---
title: "How Touchscreens Work: Capacitive and Resistive Screens, Multi-Touch and Why Gloves Do Not Work"
description: "How a phone senses your finger through glass, capacitive versus resistive screens, how multi-touch and pinch-to-zoom work, why gloves and water confuse screens and what comes next."
category: how-things-work
date: 2026-10-26
order: 5
---
Touchscreens have become so natural that small children try to swipe magazine pages and television screens. With a tap, a swipe or a pinch, we control phones, tablets, laptops, car dashboards, ticket machines and kitchen appliances. Yet the surface we touch is just a sheet of glass. How does a phone know exactly where your finger is, distinguish a tap from a swipe and follow two fingers at once to zoom into a photo? The answer lies in a clever use of electricity, and in particular in the fact that your body conducts it. This explainer describes how touchscreens work.

## Two main technologies

Most touchscreens use one of two main technologies: **capacitive** or **resistive**. Smartphones and tablets almost always use capacitive screens, while resistive screens are found in some older devices, industrial equipment and certain point-of-sale terminals. Other technologies, such as infrared and surface acoustic wave screens, are used for large displays and special applications.

## Capacitive touchscreens

### Your body conducts electricity

The human body contains water and dissolved salts, so it conducts electricity. It can also hold a small electric charge. When your finger approaches a conductive surface that is electrically charged, it changes the electric field around that surface. Capacitive touchscreens detect this tiny change.

### What is capacitance?

**Capacitance** is the ability of a system to store electric charge. A simple capacitor consists of two conductors separated by an insulator. When a voltage is applied, charge collects on the conductors. The amount of capacitance depends on the size of the conductors, their distance and the material between them.

When your finger, a conductor, comes close to an electrode in the screen, it effectively changes the capacitance at that point. The screen's controller measures these changes thousands of times per second.

### Inside a capacitive screen

A modern capacitive touchscreen is built from several thin layers:

- A protective cover glass on top, the part you touch.
- A grid of transparent electrodes, usually made of **indium tin oxide (ITO)**, a material that conducts electricity but is nearly invisible. These electrodes are arranged in rows and columns.
- The display underneath, an LCD or OLED panel that produces the image.

In many modern phones, the touch sensor is built directly into the display panel to make it thinner and brighter.

### Mutual capacitance and multi-touch

Most smartphones use a method called **projected capacitive touch** with **mutual capacitance**. The rows of electrodes act as transmitters and the columns as receivers. At every point where a row crosses a column, there is a small capacitor. The controller sends signals through the rows one at a time and measures the capacitance at each intersection.

When your finger touches the screen, it draws away some of the electric field at nearby intersections, reducing their mutual capacitance. The controller detects which intersections changed and calculates the location of the touch with high precision, often interpolating between electrodes to find the exact center.

Because the controller measures every intersection separately, it can detect several touches at the same time. This is what makes **multi-touch** possible: pinching to zoom, rotating photos with two fingers or typing quickly with both thumbs. Modern screens can track ten or more fingers simultaneously.

### Why the screen ignores your sleeve

Capacitive screens respond to conductive objects that affect the electric field, such as fingers. A plastic stylus, a pencil or a gloved finger does not change the capacitance enough to register. That is why ordinary gloves do not work on phones. "Touchscreen gloves" have conductive threads woven into the fingertips, and capacitive styluses have conductive tips that mimic a finger.

### Water and screens

Water also conducts electricity, so drops of water on a screen can cause false touches or make the screen behave erratically. Many modern phones use software that distinguishes water drops from fingers, and some switch to a special mode when wet.

### Active styluses

Advanced styluses, such as those used for drawing on tablets, contain electronics that communicate with the screen. They can report pressure, tilt and precise position, allowing fine control for writing and art. The screen can also ignore your palm resting on it while you draw, a feature called palm rejection.

## Resistive touchscreens

Resistive touchscreens work in a completely different way. They consist of two flexible layers coated with a conductive material, separated by a thin gap of air or tiny spacer dots.

When you press the screen, the top layer bends and touches the bottom layer at that point, completing an electrical circuit. A voltage is applied across one layer, and the controller measures the voltage at the point of contact to determine its position, first along one axis, then the other.

**Advantages of resistive screens:**

- They work with any object: a finger, a gloved hand, a pen or a fingernail.
- They are inexpensive.
- They work well in harsh environments.

**Disadvantages:**

- They require pressure, so they feel less responsive.
- The extra layers reduce brightness and clarity.
- Most do not support multi-touch.
- The flexible top layer can be scratched or worn.

That is why resistive screens were common in early handheld devices and some ATMs, but smartphones switched to capacitive screens.

## From touch to action

Detecting a touch is only the first step. The phone's software must interpret what you mean. The touch controller sends the coordinates of each touch to the processor many times per second, often 120 times or more. Software then recognizes **gestures**:

- A short touch and release is a **tap**.
- A touch that stays in place is a **long press**.
- A quick movement across the screen is a **swipe**.
- Two fingers moving apart or together form a **pinch**.
- Two fingers moving in a circle create a **rotation**.

The software also filters out accidental touches, such as the edge of your palm when holding the phone. Some phones measure the force of a touch using pressure sensors beneath the screen, and many use small vibration motors to provide **haptic feedback**, making virtual buttons feel more like real ones.

## Other touch technologies

- **Infrared touchscreens** use a grid of invisible infrared light beams across the screen's surface. When a finger interrupts the beams, sensors detect the location. They are used for large displays and interactive whiteboards.
- **Surface acoustic wave screens** send ultrasonic waves across the glass. A touch absorbs part of the wave, revealing its position. They offer excellent clarity and are used in some kiosks.
- **Optical touch** systems use cameras at the corners of a display to detect fingers.

## The history of touchscreens

The first finger-driven touchscreen is credited to E. A. Johnson, who described a capacitive touchscreen in 1965 at the Royal Radar Establishment in the United Kingdom, for use in air traffic control. In the 1970s, engineers developed resistive touchscreens, and researchers began exploring multi-touch in the 1980s. Touchscreens appeared in some early handheld computers and phones in the 1990s and early 2000s, usually operated with a stylus. The breakthrough for consumers came in 2007 with the launch of smartphones featuring capacitive multi-touch screens, which made finger-based gestures mainstream.

## Taking care of your touchscreen

- Clean the screen with a soft microfiber cloth, slightly dampened with water if needed. Avoid harsh chemicals that can damage oil-repellent coatings.
- Use a good-quality screen protector to prevent scratches.
- Remove dirt and moisture if the screen becomes unresponsive.
- Restart the device if the screen behaves strangely; software problems can affect touch response.

## Why screens feel so fast

A big part of what makes a touchscreen feel natural is speed. Engineers measure **touch latency**, the time between your finger moving and the image on the screen responding. Early touchscreens had delays of 100 milliseconds or more, which felt sluggish, like dragging an object through syrup. Modern phones scan their touch sensors 120 to 240 times per second or more, and combine this with high display refresh rates and software that predicts where your finger is going. The result is a delay of only a few tens of milliseconds, short enough that scrolling and drawing feel almost directly connected to your hand.

## Accessibility and touch

Touchscreens can be a barrier for some people, for example those with limited vision or motor control. Modern devices include accessibility features that change how touch works. Screen readers announce what is under your finger and require a double tap to activate it. Settings can ignore repeated touches, increase the time needed for a long press, or let a single tap act as a complex gesture. Voice control and external switches offer alternatives to touch entirely. These features show that the same hardware can be adapted through software to suit many different needs.

## Questions readers ask

**Why does my phone screen not work with gloves?**
Most phones use capacitive screens, which detect changes in electric fields caused by conductive fingers. Ordinary gloves insulate your fingers. Touchscreen gloves contain conductive threads.

**How can a screen detect several fingers at once?**
Capacitive screens measure capacitance at every intersection of a grid of electrodes, allowing them to track multiple touch points simultaneously.

**What is the difference between capacitive and resistive screens?**
Capacitive screens detect changes in electric fields from conductive objects like fingers. Resistive screens detect pressure that brings two conductive layers into contact.

**Why does water make my screen act strangely?**
Water conducts electricity and can mimic or interfere with finger touches on capacitive screens.

**Can a touchscreen feel pressure?**
Some can, using additional pressure sensors or advanced styluses that measure how hard you press.

## In short

Most modern touchscreens are capacitive: a grid of transparent electrodes beneath the glass measures tiny changes in electric fields caused by conductive fingers, allowing the device to pinpoint touches and track several fingers at once. Resistive screens work by pressure, bringing two conductive layers together, and respond to any object but lack the sensitivity and multi-touch of capacitive screens. Software turns the raw touch data into taps, swipes and pinches. Every time you scroll or zoom, your fingertip is part of an electrical circuit, quietly measured thousands of times each second.
