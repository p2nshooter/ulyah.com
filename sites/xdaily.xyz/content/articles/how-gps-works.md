---
title: "How GPS Works: Satellites, Atomic Clocks, Trilateration and Why Einstein Matters for Your Phone's Map"
description: "How your phone finds its position from satellite signals, why it needs four satellites, how atomic clocks and relativity keep GPS accurate, what limits accuracy and how other systems help."
category: how-things-work
date: 2026-10-26
order: 1
---
Open a map on your phone, and within seconds a blue dot shows exactly where you are, perhaps within a few meters. It seems almost magical, but behind that dot is a remarkable system of satellites orbiting about 12,550 miles (20,200 kilometers) above Earth, carrying some of the most precise clocks ever built. The Global Positioning System, or GPS, relies on timing so precise that it even needs to account for Einstein's theories of relativity. This explainer describes how GPS works, from the satellites in space to the receiver in your pocket.

## What GPS is

GPS is a satellite navigation system operated by the United States Space Force. It was developed by the U.S. military, with the first satellite launched in 1978, and became fully operational in 1995. Since 2000, the full accuracy of the civilian signal has been available to everyone, worldwide, free of charge.

Today, the term "GPS" is often used for all satellite navigation, but there are several systems, together called **Global Navigation Satellite Systems (GNSS)**:

- **GPS** (United States)
- **GLONASS** (Russia)
- **Galileo** (European Union)
- **BeiDou** (China)

Regional systems also exist, such as Japan's QZSS and India's NavIC. Most modern smartphones use signals from several of these systems at once, which improves accuracy and reliability.

## The three parts of GPS

### The space segment

The GPS constellation consists of about 31 operational satellites in medium Earth orbit. They are arranged in six orbital planes, so that at least four satellites are visible from almost any point on Earth at any time. Each satellite circles Earth roughly twice a day.

Each satellite carries highly accurate **atomic clocks** and continuously broadcasts radio signals containing the exact time the signal was sent and the satellite's precise position in orbit.

### The control segment

A network of ground stations around the world tracks the satellites, monitors their orbits and clocks, and sends corrections to keep the system accurate. The master control station is in Colorado.

### The user segment

This includes every GPS receiver: smartphones, car navigation systems, aircraft, ships, surveying instruments and many more. Receivers only listen to signals; they do not transmit anything back to the satellites. This means GPS can serve an unlimited number of users at once.

## Measuring distance with time

The basic idea of GPS is to measure distance using the time it takes radio signals to travel from the satellites to the receiver.

Radio signals travel at the speed of light, about 186,000 miles (300,000 kilometers) per second. Each satellite sends a signal that says, in effect, "This is satellite number X, my position is here, and this message was sent at exactly this time." The receiver notes when the signal arrives. The difference between the sending time and the arrival time, multiplied by the speed of light, gives the distance to the satellite.

Because light is so fast, timing must be extraordinarily precise. An error of just one microsecond, one millionth of a second, corresponds to an error of about 1,000 feet (300 meters) in distance.

## Trilateration: finding your position

Knowing your distance from one satellite tells you that you are somewhere on the surface of an imaginary sphere centered on that satellite. With a second satellite, you know you are somewhere on the circle where two spheres intersect. A third satellite narrows it down to two points, one of which is usually far out in space or deep inside Earth and can be ignored.

This method of finding a position from distances is called **trilateration**. It is related to, but different from, triangulation, which uses angles.

## Why four satellites are needed

In theory, three satellites would be enough. But there is a catch: the receiver's clock. The satellites carry atomic clocks that cost a fortune, while your phone has an inexpensive quartz clock that is not nearly accurate enough. If the receiver's clock is off by even a tiny fraction of a second, all the distance measurements will be wrong.

The solution is clever. The receiver uses a **fourth satellite** to solve for the error in its own clock. With four distance measurements, it can calculate four unknowns: latitude, longitude, altitude and the clock error. In effect, every GPS receiver becomes a highly accurate clock synchronized with the satellites. That is why GPS is also used worldwide to synchronize time for financial networks, power grids and mobile phone networks.

In practice, receivers use as many satellites as they can see, often a dozen or more from several systems, to improve accuracy.

## Einstein and GPS

GPS is one of the few everyday technologies where Einstein's theories of relativity matter directly.

- **Special relativity** says that moving clocks run slower. GPS satellites move at about 8,700 miles per hour (14,000 kilometers per hour) relative to Earth, so their clocks run slower than clocks on the ground by about 7 microseconds per day.
- **General relativity** says that clocks in weaker gravity run faster. The satellites are farther from Earth's mass, so their clocks run faster by about 45 microseconds per day.

The net effect is that satellite clocks run about **38 microseconds per day faster** than clocks on Earth. If this were not corrected, position errors would build up by about 6 miles (10 kilometers) per day. Engineers account for this by adjusting the satellite clocks' frequency before launch and through ongoing corrections. GPS is a daily, practical confirmation that relativity is correct.

## What limits accuracy

A typical smartphone can determine its position to within about 16 feet (5 meters) under open sky. Several factors affect accuracy:

- **Atmospheric delays:** Signals slow down slightly as they pass through the ionosphere and the lower atmosphere. Receivers use models and, in more advanced devices, signals on two different frequencies to correct for this.
- **Multipath errors:** In cities, signals bounce off buildings before reaching the receiver, making them travel farther and causing errors. These "urban canyons" are a major challenge.
- **Satellite geometry:** Accuracy is better when visible satellites are spread out across the sky rather than clustered together.
- **Obstructions:** GPS signals are weak and do not penetrate buildings, tunnels or dense forests well. That is why GPS often struggles indoors.
- **Clock and orbit errors:** Small errors in satellite clocks and positions are corrected by the control segment but not perfectly.

## How phones find you faster and indoors

Smartphones combine GPS with other technologies to locate you quickly and in difficult places:

- **Assisted GPS (A-GPS):** The phone downloads information about satellite positions through the mobile network, allowing it to find satellites much faster than a standalone receiver.
- **Wi-Fi and cell towers:** Phones can estimate their position from nearby Wi-Fi networks and mobile phone towers, whose locations are known.
- **Motion sensors:** Accelerometers, gyroscopes and compasses help track movement when satellite signals are lost, for example in tunnels.
- **Dual-frequency GNSS:** Newer phones receive signals on two frequencies, which improves accuracy, especially in cities.

## High-precision positioning

For surveying, farming, construction and scientific research, even greater accuracy is possible. Techniques like **differential GPS** and **real-time kinematic (RTK)** positioning use a fixed reference station with a precisely known position to calculate and broadcast corrections. With these methods, positions can be determined to within a few centimeters or less. Scientists use high-precision GNSS to measure the slow movement of tectonic plates and the rising and sinking of land.

## GPS beyond navigation

GPS has become part of the infrastructure of modern life:

- **Timing:** Banks, stock markets, power grids, telecommunications and the internet rely on GPS time signals to synchronize their systems.
- **Transportation:** Aircraft, ships, trucks and trains use GNSS for navigation and tracking.
- **Agriculture:** Tractors guided by GNSS plant and harvest with high precision.
- **Emergency services:** Locating callers and coordinating rescue teams.
- **Science:** Monitoring earthquakes, volcanoes, sea level and the atmosphere.

Because so much depends on it, interference with GNSS signals, whether accidental or deliberate, known as jamming and spoofing, is a growing concern.

## Questions readers ask

**Does GPS use mobile data?**
GPS itself does not require data; receivers only listen to satellite signals. However, map apps need data to download maps, and phones use data for assisted GPS to speed up positioning.

**Why does GPS not work well indoors?**
GPS signals are very weak and are blocked or reflected by walls and roofs. Phones use Wi-Fi and cell signals to estimate location indoors.

**How many satellites does a GPS receiver need?**
At least four, to calculate three-dimensional position and correct the receiver's clock. More satellites improve accuracy.

**Is GPS free?**
Yes. The civilian GPS signal is available free of charge to anyone in the world with a receiver.

**What does relativity have to do with GPS?**
Satellite clocks run faster than clocks on Earth due to relativity. Without corrections, GPS positions would drift by kilometers every day.

## In short

GPS works by measuring how long radio signals take to travel from satellites carrying atomic clocks to a receiver. Multiplying travel time by the speed of light gives distances, and with signals from at least four satellites, the receiver calculates its position and corrects its own clock through trilateration. Einstein's relativity must be accounted for, because satellite clocks run about 38 microseconds per day faster than clocks on the ground. Atmospheric delays, reflections and obstructions limit accuracy, while assisted GPS, Wi-Fi and multiple satellite systems help phones find you quickly. A small blue dot on your screen rests on a remarkable feat of physics and engineering.
