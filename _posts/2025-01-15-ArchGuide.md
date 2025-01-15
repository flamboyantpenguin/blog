---
title: Arch Linux Installation in a Nutshell
description: >-
  A guide to install Arch Linux on UEFI Systems with Secure Boot
author: flamboyantpenguin
date: 2025-01-15 22:00:00 +0530
categories: [Tech, Guides]
tags: [archlinux, linux, guide, installation]
pin: true
media_subpath: '/posts/20250115'
---

> This article is still under development
{: .prompt-info }

## Introduction

## Getting Started | Download ISO

You can download the official ISO image from [Arch Linux download page](https://archlinux.org/download). You can use [Rufus](https://rufus.ie) in Windows or GNOME-Disk-Utility or any other tool to burn the ISO to a flash drive.

This image won't work on Secure Boot enabled systems as the official images are no longer signed. For this you can either use a custom key or Preload added repacked ISO. For this guide, let's use a Preloader repacked ISO. I maintain a repository for hosting Linux installation images. You can download the repacked iso from [here](https://archive.dawn.org.in/Software/OS/Linux) or follow this [guide](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#Replacing_the_boot_loader_with_PreLoader) for doing it yourself.

After flashing the image to the drive, boot into the installation medium. Connect your drive to the system (for VM, mount the iso image directly, no need to prepare a flash drive) and reboot the system. Soon after turning on your system, run the boot menu and select the drive. The Boot Menu can be accessed using the Boot Menu key (usually `ESC`, `F9` or `F12`).

## MOK Util (Secure Boot)

When you boot using the Secure Boot image, you should see this screen if secure boot is enabled.

![MOK Management Dialog](/MOKManagementDialog.png)

Click on Enroll Hash. Select Preloader.efi and enroll it's hash. Next click on `../` and navigate to `arch`. Enroll the hash of `vmlinuz-linux`. This is the linux kernel.

Reboot after this and you should be greeted by GRUB.

## Partioning

## pacstrap

The installation medium offers a tool called `pacstrap`. This tool helps us download the latest packages and install them to another drive. This step basically prepares our root partition.

Arch wiki recommends `base`, `linux` and `linux-firmware` packages for a basic installation. We however need more packages including a bootloader to use the OS.

```bash
pacstrap -K /mnt base linux linux-firmware grub efibootmgr sbctl networkmanager man tldr nano sof-firmware wget
```

## Basic Configuration

Now that the packages are installed, we have to configure the system.

### Generating fstab

`/etc/fstab` file tells the system about the drivers to be mounted during boot. This file is therefore essential. Luckily, Arch Linux offers another tool for us to do this easily.

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

After this, chroot into the system to complete rest of the configuration. `chroot` basically means to create a virtualized copy of an OS. So we're basically shifting our shell to the new installed OS to complete configuration.

```bash
arch-chroot /mnt
```

### Time Zone, Locale and Keyboard

We set the time zone by creating a soft link of the Region and City to `/etc/localtime`

```bash
ln -sf /usr/share/zoneinfo/<Region>/<City> /etc/localtime # Replace <Region> and <City> with your Timezone ex: Asia/Kolkata
hwclock --systohc # This synchronizes the hard clock
```

Next, we have to set our system locale. Edit the `/etc/locale.gen` file and uncomment the locales you need. Use `locale-gen` to generate locale afterwards.

```bash
nano /etc/locale.gen # You probably need to uncomment this line: LANG=en_US.UTF-8
locale-gen
```

Next, we have to configure the console keyboard layout.

```bash
nano /etc/vconsole.conf 
```

For default US keyboard, add these lines

```bash
KEYMAP=us 
FONT=ter-118n
```

You can check other layouts and font options on the Arch Wiki.

## Bootloader Installation

Next we have to install the bootloader. In this guide, we use GRUB.

### UEFI Without Secure Boot

```bash
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg
```

### UEFI With Secure Boot

There are a lot of ways to do this as clearly documented in the [Arch Wiki](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#Implementing_Secure_Boot). I'm doing this by disabling shim-lock on GRUB and I use `sbctl` to generate custom keys to load them to the BIOS. I believe this is one of the easiest ways to do this.

## Configure User Accounts

First let's set a password for root. You can skip this setup if you're confident about the user configuration step after this.

```bash
passwd root # Please don't forget this
```

For a standard Desktop Experience, it is not recommended to work as the root user as it can cause unintended harm on the system. So let's create a username and configure sudo for running administrator commands.

```bash
groupadd wheel
useradd -m -G wheel <username> # Replce <username> with a name of your choice
passwd <username>
```

After this edit `/etc/sudoers` and uncomment the line: `%wheel ALL=(ALL:ALL) ALL`

```bash
nano /etc/sudoers # Uncomment the line: %wheel ALL=(ALL:ALL) ALL
```

## Extras

### Enable NetworkManager on Boot

```bash
systemctl enable NetworkManager
```

## sbctl enrollment (Secure Boot)

## Install a GUI

## Conclusion

After all this, `exit` from `chroot` and reboot the system. Enjoy your Arch Linux experience and don't forget to add the tagline `I use arch btw` wherever you go!

DAWN/ペンギン
