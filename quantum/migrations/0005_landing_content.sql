CREATE TABLE `landing_services` (
	`id` text PRIMARY KEY NOT NULL,
	`icon` text DEFAULT '🔧' NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`bullets` text DEFAULT '' NOT NULL,
	`price_idr` integer,
	`price_label` text DEFAULT 'Mulai dari' NOT NULL,
	`price_note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `landing_services_sort_idx` ON `landing_services` (`sort_order`);
--> statement-breakpoint
-- Tiga kartu yang selama ini ditulis di kode dipindahkan apa adanya, supaya
-- halaman depan tidak mendadak kosong setelah migrasi. Id-nya tetap agar
-- migrasi ini aman dijalankan ulang.
INSERT OR IGNORE INTO `landing_services`
	(`id`, `icon`, `title`, `summary`, `bullets`, `price_label`, `sort_order`, `active`)
VALUES
	('svc_karoseri', '🚌', 'Karoseri', 'Pembuatan bodi di atas chassis pilihan Anda.',
	 'Bodi bus besar & medium
Microbus
Box besi & aluminium
Wingbox
Dump
Tangki', 'Mulai dari', 1, 1),
	('svc_bodyrepair', '🎨', 'Body Repair', 'Perbaikan dan pengecatan bodi kendaraan.',
	 'Body repair
Cat mobil
Repaint
Refinishing
Poles body', 'Mulai dari', 2, 1),
	('svc_service', '🔧', 'Service Mobil', 'Perawatan berkala sampai perbaikan besar.',
	 'Service mesin & turun mesin
Tune up
Ganti oli
Rem & kaki-kaki
Transmisi MT/AT
Service AC
Scanner mobil', 'Mulai dari', 3, 1);
