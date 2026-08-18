-- Menambah nama pengguna untuk login.
--
-- Kolomnya NOT NULL, jadi diisi bertahap: tambah dengan nilai bawaan kosong,
-- isi dari bagian depan email untuk baris yang sudah ada, baru dikunci unik.
-- Kalau indeks uniknya dibuat lebih dulu, semua baris lama bertabrakan di ''.
ALTER TABLE `users` ADD COLUMN `username` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `users`
SET `username` = lower(substr(`email`, 1, instr(`email`, '@') - 1))
WHERE `username` = '' AND instr(`email`, '@') > 1;
--> statement-breakpoint
-- Jaring pengaman untuk baris tanpa '@' di emailnya: pakai potongan id-nya,
-- yang sudah pasti unik, ketimbang membiarkan nilai kosong yang bertabrakan.
UPDATE `users` SET `username` = 'user-' || substr(`id`, -8) WHERE `username` = '';
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);
