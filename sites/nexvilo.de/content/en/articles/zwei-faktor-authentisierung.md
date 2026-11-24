---
slug: two-factor-authentication-simply-explained-the-second-key-for-your
title: "Two-factor authentication simply explained: The second key for your accounts"
description: What two-factor authentication is, what methods there are (SMS, app, security key, passkey), how to turn it on for email, Google, Apple and Co. and secure recovery codes.
---
Imagine someone found out your password, through a data leak, a fake website, or just guessing. Without any further protection, he can now log into your account, read your emails, order on your behalf or transfer money. With **two-factor authentication** (often called 2FA), the password alone is not enough. The attacker would also need something that only you have, usually your smartphone. This guide explains how it works, what methods there are, which is safest and how you can set it up without locking yourself out in an emergency.

## The principle: knowledge plus possession

When registering with two factors, you must provide two different types of evidence:

1. **Something you know:** your password or PIN.
2. **Something you own:** your smartphone, a security key, or a bank card.

Sometimes **something that is you** is added as an alternative: your fingerprint or your face, which you use to unlock the smartphone.

You've known the principle from online banking for a long time: To make a transfer, you need your access data and an additional TAN from the app or from a device. This has even been a legal requirement for payments in the EU for several years now. For email, social networks and online shops you usually have to switch on the second factor yourself.

## Why the extra step is worth it

The second confirmation will take you a few seconds when registering. In return, it prevents most account takeovers. Even if an attacker knows your password, he will fail on the second factor. Many services also remember trusted devices, so you rarely have to enter the code on your own laptop or smartphone.

Two-factor is particularly important for:

- your **email inbox**, because passwords from other services are reset via it,
- your **Apple, Google or Microsoft account**,
- **Payment services** such as PayPal,
- **social networks** and **messengers**, through which scammers like to impersonate you,
- your **password manager**,
- **Online shops** with stored payment details,
- Accounts with **authorities** and **health insurance companies**, if they offer it.

## The different methods

Not every second factor is equally safe. Here are the common methods, from less to very secure.

### Code via SMS

When you register you will receive an SMS with a code. This is easy and better than no second factor at all. But it has weaknesses: SMS messages can be intercepted, and criminals sometimes try to get a new SIM card with your number from the mobile phone provider. In addition, many people fall for scammers who ask for the “confirmation code” on the phone.

**Assessment:** Good as a starter, but replace with an app if possible.

### Code via email

Some services send a code to your email address. This only protects if your email inbox itself is well secured.

### Authentication app

Apps like **Google Authenticator**, **Microsoft Authenticator**, **Aegis** (Android), **2FAS** or the code function in password managers generate a new six-digit code every 30 seconds. The code is calculated on your device, without SMS and without an internet connection. Experts call this **TOTP** (time-based one-time passwords).

**Assessment:** Significantly more secure than SMS and the best standard for most people.

### Confirmation via push message

Some services, such as Google, Microsoft or many banks, send a message to your app: “Are you trying to log in?” You tap “Yes” or confirm with your fingerprint. That's convenient.

**Important:** Never confirm a registration that you did not start yourself. Attackers who know your password will sometimes try to wear you down with many requests in a row until you accidentally confirm. For unexpected requests: reject and change the password.

### Hardware security key

A security key is a small device in the format of a USB stick, such as **YubiKey**, **Nitrokey** or **Google Titan**. You insert it when you register or hold it to your smartphone (NFC) and tap it. Security keys based on the **FIDO2** standard are **phishing-proof**: they only work on the real website.

**Assessment:** Very secure, ideal for people with particularly sensitive accounts, such as journalists, club boards or self-employed people. It's best to buy two keys, one for everyday use and one as a reserve.

### Passkeys

Passkeys are the latest form and combine password and second factor in one step. You sign in with your fingerprint, face, or device PIN, and the device cryptographically proves it's you. Passkeys are also phishing-proof. Find out more in our guide to secure passwords.

| Method | Security | Convenience | Typical use |
|---|---|---|---|
| SMS code | medium | high | Get started when nothing else works |
| Authentication app | high | high | Standard for email, social networks, shops |
| Push confirmation | high if used carefully | very high | Google, Microsoft, banks |
| Security key | very high | medium | particularly important accounts |
| Passkey | very high | very high | Wherever offered, always use it |

## Set up two-factor: This is how it usually works

The process is similar for almost all services:

1. Log in to the service and open **Security Settings**. They are often called “Security,” “Login and Security,” or “Protect Account.”
2. Choose **Two-Factor Authentication**, **Two-Step Verification**, or **Two-Step Login**.
3. Select **Authentication App** as the method.
4. The service shows a **QR code**. Open your authenticator app, tap Add, and scan the code.
5. Enter the six-digit code from the app to confirm setup.
6. **Save the recovery codes** that the service shows you. More on that in a moment.

### Where you can find the setting on well-known services

- **Google:** myaccount.google.com > *Security > Two-Step Verification.* Google recommends passkeys and push confirmations on your smartphone.
- **Apple ID:** Two-factor authentication is automatically enabled on newer accounts. Check under *Settings > [your name] > Sign in & security*.
- **Microsoft:** account.microsoft.com > *Security > Advanced security options.*
- **WhatsApp:** *Settings > Account > Two-step verification.* Here you set a six-digit PIN that will be requested when setting up on a new device. This protects against fraudsters who want to take over your account using an SMS code.
- **Amazon:** *Account > Sign in & Security > 2-Step Verification.*
- **PayPal:** *Settings > Security > 2-Step Verification.*
- **Instagram and Facebook:** in the Meta account overview under *Password and security > Two-factor authentication.*

## Recovery codes: your emergency exit

What happens if your smartphone is lost or broken? Then you will no longer have access to the authentication app and could lock yourself out of your accounts. There are **recovery codes** (also backup codes): a list of one-time codes that you get during setup.

Here's how to deal with it correctly:

- **Print out** or copy the codes and keep them in a safe place at home, such as your important documents folder.
- Additionally, you can save them in your **Password Manager**.
- **Don't** save it as a screenshot on the phone you're backing up.
- Each code works **only once**. If you've used one, cross it out and have new ones created as needed.

Many services also allow a **second method** as a backup, such as a phone number, a second security key, or a recovery contact. Set up at least one reserve.

## Moving to a new smartphone

The most delicate moment is changing your smartphone. Codes from an authentication app do not always move automatically.

- **Google Authenticator** can sync codes with your Google Account or export them via QR code using Transfer Accounts.
- **Microsoft Authenticator** backs up accounts in the cloud if you have enabled backup in Settings.
- **Password manager with code function** synchronize automatically.
- **Aegis** and **2FAS** offer encrypted exports.

**Rule of thumb:** Only reset the old smartphone once you have successfully logged in to all important accounts on the new one.

## Two-factor scams

Criminals have adapted to the second factor. The most common stitches:

- **The fake support call:** Someone pretends to be a bank, parcel service or Microsoft and asks you to read a code “for verification”. **Never give out a code over the phone, text, or chat.** Real companies don't ask for it.
- **The WhatsApp code from “Friends”:** A contact writes: “I accidentally sent you a code, can you forward it to me?” There is almost always someone behind it who wants to take over your WhatsApp account.
- **Fake Login Pages:** Some phishing sites ask for password **and** code and use both immediately. Passkeys and security keys help against this because they only work on the real site.
- **Push bombardment:** lots of login requests in a row. Never confirm unless you are logging in yourself.

## Set up two-factor for older relatives

The second factor can be confusing at first, especially for older people. Nevertheless, it is particularly worthwhile because they are often the target of fraudsters. A few tips for setup:

- **Choose the easiest, most secure method.** For many people, a push confirmation on their own smartphone is easier to understand than six-digit codes. Fingerprint passkeys are even easier.
- **Explain the most important rule in one sentence:** “Unless you sign in yourself, you don't confirm anything and you don't give codes to anyone.”
- **Keep the recovery codes together**, for example in an envelope in the important documents folder.
- **Set yourself up as a recovery contact** if the service offers it, such as Apple ID. Then you can help in an emergency without knowing the password.
- **Practice together** how registration with a second factor works so that it doesn't cause any uncertainty in everyday life.

## Frequently asked questions

**What if I travel abroad and don't get a text message?**
An authentication app works without a mobile network or internet. That's another reason to choose it over SMS.

**Do I have to enter the code every time I log in?**
Mostly not. On trusted devices, you can check the “Remember this device” box.

**Can I use one authentication app for all accounts?**
Yes, an app can generate codes for any number of services.

## Conclusion

Two-factor authentication is one of the most effective measures against stolen accounts. First turn it on for email, your Apple, Google or Microsoft account, payment services and Messenger. If possible, use an authentication app, passkeys or security key instead of SMS, and keep paper recovery codes safe. Above all, never give a code to anyone who asks you for it.
