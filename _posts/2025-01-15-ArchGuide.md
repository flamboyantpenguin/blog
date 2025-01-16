---
title: Arch Linux Installation in a Nutshell
description: >-
  A guide to install Arch Linux on UEFI Systems with Secure Boot
author: flamboyantpenguin
date: 2025-01-16 22:20:00 +0530
categories: [Tech, Guides]
tags: [archlinux, linux, guide, installation]
pin: true
media_subpath: '/posts/20250116'
---

## Introduction

Arch Linux is an open source, rolling release distribution. The OS is designed to be intentionally minimal and gives the choice of customization to the user. While this may sound interesting, this means it's the responsibility of the user to manage basically everything.

For this reason, the OS known for the difficulty to use. People who achieve this are usually given the universal right to use the phrase `i use arch btw`.

I personally daily drive Arch mainly because

- It's minimal
- It features a good package management system (`pacman`)
- It's an oppurtunity for one to learn things myself as I'm forced to customize things myself
- It's a rolling release distribution. This means I get package updates very quickly. For some other distributions like Ubuntu, you would have to wait till the next release for major package updates like new versions of GNOME

This blog is a brief guide to install the OS. I believe the [Arch Wiki](https://wiki.archlinux.org) itself is the best guide for not just installation, but almost everything Linux config related. But as per the request of some of my friends, I decided to prepare a brief guide to cover the installation procedure in a nutshell.

This guide is for installing the OS on UEFI systems. Skip the sections with `(Secure Boot)` on the title if you do not intent to use Secure Boot.

Do comment below for suggestions, feedback and doubts.

## Prerequisites

It is recommended that you learn the basics of the topics below before you proceed to installation.

- UEFI
- Secure Boot
- Disks and Partitions
- Dual Boot

## Getting Started | Download ISO

You can download the official ISO image from [Arch Linux download page](https://archlinux.org/download). You can use [Rufus](https://rufus.ie) in Windows or GNOME-Disk-Utility or any other tool to burn the ISO to a flash drive.

This image won't work on Secure Boot enabled systems as the official images are no longer signed. There are however ways to sign the official ISO by using custom keys or by repacking the ISO with a [signed copy of Preloader](https://blog.hansenpartnership.com/linux-foundation-secure-boot-system-released). If you find it difficult to do this, you can turn of Secure Boot for the installation procedure.

I maintain a repository for hosting Linux installation images. You can download the repacked iso from [there](https://archive.dawn.org.in/Software/OS/Linux) or follow this [guide](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#Replacing_the_boot_loader_with_PreLoader) for doing it yourself.

After flashing the image to the drive, boot into the installation medium. Connect your drive to the system (for VM, mount the iso image directly, no need to prepare a flash drive) and reboot the system. Soon after turning on your system, run the boot menu and select the drive. The Boot Menu can be accessed using the Boot Menu key (usually `ESC`, `F9` or `F12`).

## MOK Util (Secure Boot)

When you boot using the Secure Boot image, you should see this screen if secure boot is enabled.

![Hash Tool Dialog](/HashToolDialog.png)

Click on Enroll Hash. Select `loader.efi` and enroll it's hash. Next navigate to `arch` directory. Enroll the hash of `vmlinuz-linux`. This is the linux kernel.

Reboot after this and you should be greeted by GRUB.

{%
  include embed/video.html
  src='/HashTool.mp4'
  title='Hash Tool Demo'
  autoplay=true
  loop=true
  muted=true
%}

## Partitioning

> Read this section carefully before action. Do not blindly copy paste the commands. Mistakes could result in data loss. Proceed with caution
{: .prompt-warning }

Partioning is an important step in the installation procedure. One has to be careful not to tamper the partitions used by other Operating Systems installed in the system. There are a lot of ways to partition the drive, but a minimal UEFI setup requires atleast two partitions.

- `/`: The root partition
- `/boot/efi`: The efi partition

A UEFI system should have a `FAT32` formatted partition called the efi partition. This partition acts as the storage place for the UEFI boot loaders, applications and drivers to be launched by the UEFI firmware. However, even for a dual boot setup, a system can have only one efi partition. This means if you're dual booting Arch with Windows, make sure to mount the existing efi partition to `/boot/efi` and don't accidentally format it.

The root partition can be formatted as `ext4`, `xfs` or any other as per your preference. Note that setting up LUKS Encryption or a `btrfs` file system or an LVM partioning might be more complicated and outside the scope of this guide. Follow the [Arch Wiki](https://wiki.archlinux.org/title/Partitioning) for more info.

In Linux, there's a unique name for each hard disks. Usually HDDs are denotes as `/dev/sda`, `/dev/sdb` and so on. SSDs will be `/dev/nvme0n1`, `/dev/nvme0n2` and so on. Partitions are identitied by adding a number to these names. For instance the first partition of the first HDD on the system would be `/dev/sda1`. Keep this in mind before you start partioning.

I'm familar with `parted` for partioning via the command line, so this guide will be following that.

### Viewing Partitions and Disk Info

Use the `lsblk` command to view the block devices on the system.

```bash
lsblk
lsblk -o NAME,UUID,PARTLABEL,FSTYPE,MOUNTPOINT
```

![Arch Install Partioning - Viewing Block Devices](/Partioning_View.png)

### Creating Partitions

To format the drive as GPT for UEFI

```bash
# WARNING! Don't do this if you're dual booting the system. This will format the entire drive
parted <dev> mklabel gpt
```

To view existing disk info and partitions

```bash
parted <dev> print # Replace <dev> with the disk ex: /dev/sda
```

To create a new parition.

```bash
# Replace <start> with the end of the parition before it, for an empty disk use 0G. Replace <partname> with a name of your choice
parted <dev> mkpart <partname> <start> <start+size>
```

To delete a partition

```bash
parted <dev> rm <number> # Replace <number> with the partition number
```

### Formatting the Partitions

Use the `mkfs` command to format the partions.

```bash
mkfs.ext4 <rootpart> # Replace <rootpart> with your root partition ex: /dev/sda2

# WARNING! Do not do this step for dual boot setup. Rather mount the efi partion directly
mkfs.fat -F 32 <efipart> # Replace <efipart> with your efi partition ex: /dev/sda1
```

### Mount the Partitions

```bash
mount <rootpart> /mnt # Replace <rootpart> with your root partition ex: dev/sda2

# You can find your existing efi partion using lsblk command. It will be a FAT32 formatted partition
mount --mkdir <efipart> /mnt/boot/efi # Replace <efipart> with your efi partition ex: /dev/sda1
```

### Examples

Please do not copy this blindly and paste it to your system. Please check your existing partions and disk info before you continue.

{%
  include embed/video.html
  src='/Partioning.mp4'
  title='Partioning Demo'
  autoplay=true
  loop=true
  muted=true
%}

[comment]: # ![MOK Management Dialog](/Partioning_VM_DualBoot.png)

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

> Read this section carefully before action. Do not blindly copy paste the commands. Mistakes could potentially brick your system
{: .prompt-warning }

There are a lot of ways to do this as clearly documented in the [Arch Wiki](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#Implementing_Secure_Boot). I'm doing this by disabling shim-lock on GRUB and I use `sbctl` to generate custom keys to load them to the BIOS. I believe this is one of the easiest ways to do this.

Some modern systems like Dell offers a `Audit Mode` which makes the BIOS keys writeable. After enabling this, you can use `sbctl` commands to enroll the keys.

In older systems, you need to delete all the existing Secure Boot keys. This puts the system on Setup Mode after which you can use `sbctl` to enroll your keys along with Microsoft's keys to the BIOS. While you may be a Microsoft hater, **please don't skip uploading Microsoft's Secure Boot keys** as the firmware of some external pheriperals like graphics cards also rely on Microsoft's Secure Boot keys. They won't be able to work without Microsoft's keys.

Save this script as a bash file and run it. The GRUB modules specified here are required for standard OS installations. I was able to get most of the required modules thanks to Ubuntu and Arch Wiki.

```bash
#!/bin/bash


efi="/boot/efi"
kernel="/boot/vmlinuz-linux"


CD_MODULES="
	all_video
	boot
	btrfs
	cat
	chain
	configfile
	echo
	efifwsetup
	efinet
	ext2
	fat
	font
	gettext
	gfxmenu
	gfxterm
	gfxterm_background
	gzio
	halt
	help
	hfsplus
	iso9660
	jpeg
	keystatus
	loadenv
	loopback
	linux
	ls
	lsefi
	lsefimmap
	lsefisystab
	lssal
	memdisk
	minicmd
	normal
	ntfs
	part_apple
	part_msdos
	part_gpt
	password_pbkdf2
	png
	probe
	reboot
	regexp
	search
	search_fs_uuid
	search_fs_file
	search_label
	sleep
	smbios
	squash4
	test
	true
	video
	xfs
	zfs
	zfscrypt
	zfsinfo
	tpm
	"


GRUB_MODULES="$CD_MODULES
	cryptodisk
	gcry_arcfour
	gcry_blowfish
	gcry_camellia
	gcry_cast5
	gcry_crc
	gcry_des
	gcry_dsa
	gcry_idea
	gcry_md4
	gcry_md5
	gcry_rfc2268
	gcry_rijndael
	gcry_rmd160
	gcry_rsa
	gcry_seed
	gcry_serpent
	gcry_sha1
	gcry_sha256
	gcry_sha512
	gcry_tiger
	gcry_twofish
	gcry_whirlpool
	luks
	lvm
	mdraid09
	mdraid1x
	raid5rec
	raid6rec
	"


grub-install --target=x86_64-efi --efi-directory=$efi --bootloader-id=GRUB --modules="$GRUB_MODULES" --disable-shim-lock
grub-mkconfig -o /boot/grub/grub.cfg

# sed -i 's/SecureBoot/SecureB00t/' /boot/efi/EFI/GRUB/grubx64.efi # Uncomment this if you still face Secure Boot violation issues
sbctl create-keys
chattr -i /sys/firmware/efi/efivars/KEK-8be4df61-93ca-11d2-aa0d-00e098032b8c
chattr -i /sys/firmware/efi/efivars/db-d719b2cb-3d3a-4596-a3bc-dad00e67656f
sbctl sign -s "$efi/EFI/GRUB/grubx64.efi"
sbctl sign -s $kernel
sbct enroll-keys -m # WARNING! Don't forget the -m flag. Doing so could potentially brick your system
```

If you can't save this as a file and run it, you can download this script from [DAWN Archives](https://archives.dawn.org.in).

```bash
wget https://archive.dawn.org.in/Scripts/efi/install-grub-efi
chmod u+x install-grub-efi

# Replace <efi> with your efi mount location and <kernel> with your kernel location ex: /boot/efi and /boot/vmlinuz-linux respectively 
./install-grub-shim
```

## Configure User Accounts

First let's set a password for root. You can skip this setup if you're confident about the user configuration step after this.

```bash
passwd root # Please don't forget this password
```

For a standard Desktop Experience, it is not recommended to work as the root user as it can cause unintended harm on the system. So let's create a username and configure `sudo` for running administrator commands.

```bash
groupadd wheel
useradd -m -G wheel <username> # Replce <username> with a name of your choice
passwd <username>
```

After this edit `/etc/sudoers` and uncomment the line: `%wheel ALL=(ALL:ALL) ALL`

```bash
nano /etc/sudoers # Uncomment the line: %wheel ALL=(ALL:ALL) ALL
```

Now you should be able to login as the username you created and use `sudo` for administrator commands

## Exit Installation Medium

After all this, `exit` from `chroot` and `reboot` the system.

## Extras

### Enable NetworkManager on Boot

Doing this might help you set up the network automatically on boot

```bash
sudo systemctl enable NetworkManager
```

### Enable Bluetooth

You need to install Bluetooth packages and enable `bluetooth.service`. Yes, using Arch Linux means doing almost everything yourself.

```bash
sudo pacman -S bluez bluez-utils
sudo systemctl enable --now bluetooth
```

### Fix Time Errors in Dual Boot Setup

You might notice time errors after switching between Operating Systems in the dual boot system. This is becuase Windows sets the system time (BIOS) as the same time zone, whereas Linux sets the system time to UTC. You can fix this by changing this behaviour on Linux.

```bash
timedatectl set-local-rtc 1
```

### sbctl enrollment (Secure Boot)

> Skip this section if you already followed [UEFI With Secure Boot](https://blog.flamboyantpenguin.in/posts/ArchGuide/#uefi-with-secure-boot) section.
{: .prompt-info }

Before you continue, turn on `Audit Mode` or `Setup Mode` for Secure Boot in BIOS settings.

Some modern systems like Dell offers a `Audit Mode` which makes the BIOS keys writeable. After enabling this, you can use `sbctl` commands to enroll the keys.

In older systems, you need to delete all the existing Secure Boot keys. This puts the system on Setup Mode after which you can use `sbctl` to enroll your keys along with Microsoft's keys to the BIOS. While you may be a Microsoft hater, **please don't skip uploading Microsoft's Secure Boot keys** as the firmware of some external pheriperals like graphics cards also rely on Microsoft's Secure Boot keys. They won't be able to work without Microsoft's keys.

Save this script as a bash file and run it. The GRUB modules specified here are required for your OS to function properly. I was able to get most of the required modules thanks to Ubuntu and Arch Wiki.

```bash
# Run all this as root
sudo su -
sbctl status
sbctl create-keys
chattr -i /sys/firmware/efi/efivars/KEK-8be4df61-93ca-11d2-aa0d-00e098032b8c
chattr -i /sys/firmware/efi/efivars/db-d719b2cb-3d3a-4596-a3bc-dad00e67656f
sbctl enroll-keys -m # WARNING! Don't forget the -m flag. Doing so could potentially brick your system
sbctl sign -s /boot/vmlinuz-linux
sbctl sign -s /boot/efi/EFI/GRUB/grubx64.efi
exit
```

After doing this restart your system and turn on Secure Boot if disabled. You might need to change the BIOS Secure Boot settings back to `Deployed Mode`. Your OS installation should now be secure boot protected!

### Install and Configure Plymouth

Plymouth is a package in Linux responsible for showing the beautiful loading screen on boot. Follow these steps to install and configure it.

```bash
sudo pacman -S plymouth

# After installation, edit `/etc/default/grub` and modify `GRUB_CMDLINE_DEFAULT` line to "quiet splash"
sudo nano /etc/default/grub # GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

### Install Custom GRUB Theme

There are tons of grub themes on the internet. For this guide, I will show a demonstration using [`distro-grub-themes`](https://github.com/AdisonCavani/distro-grub-themes).

```bash
git clone https://github.com/AdisonCavani/distro-grub-themes
cd distro-grub-themes/themes
mkdir -p /boot/grub/themes/distro-theme-grub
sudo tar -xaf <theme>.tar -C /boot/grub/themes/distro-theme-grub # Replace <theme> with a theme of your choice from the directory

# Edit `/etc/default/grub` and add/modify `GRUB_THEME` line to "/boot/grub/themes/distro-theme-grub/theme.txt"
sudo nano /etc/default/grub # GRUB_THEME="/boot/grub/themes/distro-theme-tilde/theme.txt"
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

## Install a GUI

Arch Linux repositories host packages for most GUI environments. You can install one of them or even use them together. Here are some of the commonly used Graphical environments.

- [GNOME](https://www.gnome.org/)

```bash
sudo pacman -S gnome gnome-extras
```

![GNOME Desktop](/GNOMEonArch.png)

- [KDE Plasma](https://kde.org/plasma-desktop/)

```bash
sudo pacman -S plasma
```

![KDE Plasma Desktop de Penguin](/KDEPlasmaonArch.png)

- [Budgie](https://buddiesofbudgie.org/)

```bash
sudo pacman -S budgie
```

![Budgie Desktop](/BudgieonArch.png)

## Conclusion

This guide show cover the basics of Arch Linux installation. As I mentioned before, some things could differ and be prepared to face system specific errors. Do let me know in the comments or seek help from the community online. [Arch Wiki](https://wiki.archlinux.org) also remains as one of the best place to learn more, so do check it out.

Enjoy your Arch Linux experience and don't forget to add the tagline `I use arch btw` wherever you go!

Feel free to comment below for suggestions, feedback and doubts.

DAWN/ペンギン
