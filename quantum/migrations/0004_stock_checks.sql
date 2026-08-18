-- Pemeriksaan stok (opname) beserta rincian per barang.
CREATE TABLE `stock_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`check_number` text NOT NULL,
	`period` text DEFAULT 'mingguan' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`checked_at` integer NOT NULL,
	`applied_at` integer,
	`item_count` integer DEFAULT 0 NOT NULL,
	`diff_count` integer DEFAULT 0 NOT NULL,
	`damaged_qty` integer DEFAULT 0 NOT NULL,
	`lost_qty` integer DEFAULT 0 NOT NULL,
	`loss_value_idr` integer DEFAULT 0 NOT NULL,
	`expense_id` text,
	`checked_by` text,
	`notes` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_checks_check_number_unique` ON `stock_checks` (`check_number`);
--> statement-breakpoint
CREATE INDEX `stock_checks_checked_idx` ON `stock_checks` (`checked_at`);
--> statement-breakpoint
CREATE INDEX `stock_checks_status_idx` ON `stock_checks` (`status`);
--> statement-breakpoint
CREATE TABLE `stock_check_items` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_check_id` text NOT NULL,
	`item_id` text NOT NULL,
	`system_qty` integer DEFAULT 0 NOT NULL,
	`physical_qty` integer DEFAULT 0 NOT NULL,
	`damaged_qty` integer DEFAULT 0 NOT NULL,
	`lost_qty` integer DEFAULT 0 NOT NULL,
	`unit_cost_idr` integer DEFAULT 0 NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`notes` text,
	FOREIGN KEY (`stock_check_id`) REFERENCES `stock_checks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `stock_check_items_check_idx` ON `stock_check_items` (`stock_check_id`);
--> statement-breakpoint
CREATE INDEX `stock_check_items_item_idx` ON `stock_check_items` (`item_id`);
