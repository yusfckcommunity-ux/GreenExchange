<img width="1254" height="1254" alt="image" src="https://github.com/user-attachments/assets/6f377f7e-57fa-44ed-b594-f18780a1f41f" /># GREENEXCHANGE

## Open Environmental Asset Marketplace

Platform perdagangan digital untuk Renewable Energy Certificate (REC) dan Carbon Credit berbasis mekanisme market exchange terbuka.

---

# DAFTAR ISI

1. Tentang Project
2. Latar Belakang
3. Permasalahan Pasar
4. Solusi GreenExchange
5. Fitur Utama
6. Arsitektur Sistem
7. Struktur Database
8. Alur Sistem
9. API Endpoint
10. Matching Engine
11. Sistem Portfolio
12. Sistem Issues & Approval
13. Sistem Inbox & Notification
14. Sistem Account
15. Teknologi yang Digunakan
16. Future Development
17. Target Pengguna
18. Cara Menjalankan Project
19. Roadmap
20. Penutup

---

# 1. TENTANG PROJECT

GreenExchange adalah platform perdagangan digital yang dirancang untuk mempertemukan supply dan demand pada pasar Renewable Energy Certificate (REC) dan Carbon Credit melalui sistem market exchange terbuka.

Platform ini mengadopsi pendekatan modern financial exchange dengan:

* order book
* matching engine
* market-based pricing
* portfolio management
* project listing
* approval workflow
* notification system
* analytics dan price tracking

GreenExchange bertujuan menciptakan pasar aset lingkungan yang:

* transparan
* likuid
* accessible
* scalable
* market-driven

---

# 2. LATAR BELAKANG

Seiring meningkatnya dorongan global menuju Net Zero Emission (NZE), organisasi dan industri mulai membutuhkan mekanisme untuk:

* mengurangi emisi karbon
* melakukan carbon offset
* membuktikan penggunaan energi terbarukan

Dua instrumen utama dalam ekosistem ini adalah:

## Carbon Credit

Carbon Credit merepresentasikan pengurangan atau penyerapan emisi CO₂ yang terverifikasi.

## Renewable Energy Certificate (REC)

REC merepresentasikan produksi energi listrik dari sumber energi terbarukan.

Namun, pasar aset lingkungan saat ini masih memiliki berbagai keterbatasan struktural.

---

# 3. PERMASALAHAN PASAR

## Bursa Bersifat Tertutup

Sebagian besar platform karbon masih berjalan dalam model B2B tertutup.

## Matching Market Rendah

Supply dan demand sering tidak bertemu secara efisien.

## Likuiditas Rendah

Aset lingkungan sulit diperdagangkan secara cepat.

## Fragmented Market

Pembelian sering kali harus dilakukan dalam bentuk satu proyek penuh.

## Harga Tidak Transparan

Valuasi sering terpusat dan rawan greenwashing.

## MRV Lemah

Measurement, Reporting, and Verification masih sulit diaudit secara real-time.

---

# 4. SOLUSI GREENEXCHANGE

GreenExchange membangun sistem perdagangan terbuka berbasis market exchange.

## Bursa Terbuka

Siapa saja dapat berpartisipasi:

* voluntary market
* compliance market
* retail participant
* perusahaan
* project issuer

## Market-Based Trading

Harga dibentuk melalui mekanisme supply dan demand.

## Matching Engine

Sistem melakukan matching otomatis antara buyer dan seller.

## Continuous Quantity Trading

User tidak harus membeli satu proyek penuh.

## Transparansi Tinggi

Semua transaksi dan metadata project dapat ditelusuri.

## AI-Based MRV (Future)

Roadmap pengembangan mencakup AI-assisted verification dan compliance monitoring.

---

# 5. FITUR UTAMA

## Marketplace

Menampilkan seluruh asset REC dan Carbon Credit yang tersedia.

## Order Book

Menampilkan:

* buy queue
* sell queue
* market depth

## Trading System

Mendukung:

* buy order
* sell order
* cancel order
* partial fill
* full fill

## Matching Engine

Matching otomatis berdasarkan:

* price priority
* time priority

## Portfolio

Menampilkan:

* total owned
* blocked quantity
* available quantity
* average price
* market price
* unrealized pnl

## Price History

Menampilkan histori harga market.

## Symbol Information

Menampilkan detail project:

* issuer
* certification
* region
* project type
* gallery image
* certificate
* map

## Issues System

User dapat mengajukan project baru.

## Approval Workflow

Admin dapat:

* approve issue
* reject issue

## Inbox & Notification

Notifikasi real-time terkait:

* order
* trade
* approval
* cancelation
* system activity

## Account Management

Mendukung:

* create account
* update profile
* google login
* KYC status

---

# 6. ARSITEKTUR SISTEM

GreenExchange menggunakan arsitektur sederhana berbasis:

## Backend

Google Apps Script sebagai REST-like backend service.

## Database

Google Spreadsheet digunakan sebagai database lightweight.

## Client

Python client dan Web UI.

## Communication Protocol

Client berkomunikasi melalui HTTP POST.

Format:

/action endpoint menggunakan query parameter.

Contoh:

?action=buy
?action=get_market
?action=get_portfolio

Payload dikirim dalam format JSON.

Response dikembalikan dalam format JSON.

---

# 7. STRUKTUR DATABASE

## users

| column   |
| -------- |
| user_id  |
| username |
| password |

## accounts

| column       |
| ------------ |
| user_id      |
| cash_balance |
| blocked_cash |
| full_name    |
| email        |
| phone        |
| avatar_url   |
| status       |
| kyc_status   |
| joined_at    |
| company_name |
| google_id    |

## symbols

| column           |
| ---------------- |
| symbol           |
| name             |
| class            |
| is_active        |
| last_price       |
| min_qty          |
| description      |
| logo_url         |
| certification    |
| issuer           |
| project_type     |
| region           |
| commisioned_year |
| credit_unit      |
| total_credit     |
| credit_per_qty   |
| status           |
| image_url_1      |
| image_url_2      |
| image_url_3      |
| image_url_4      |
| image_url_5_long |
| certificate_url  |
| map_url          |

## orders

| column          |
| --------------- |
| id              |
| user_id         |
| symbol          |
| side            |
| price           |
| quantity        |
| filled_quantity |
| status          |
| blocked_qty     |
| created_at      |

## position

| column      |
| ----------- |
| user_id     |
| symbol      |
| quantity    |
| avg_price   |
| blocked_qty |

## trades

| column        |
| ------------- |
| trade_id      |
| buy_order_id  |
| sell_order_id |
| symbol        |
| price         |
| quantity      |
| time          |

## issues

| column           |
| ---------------- |
| issue_id         |
| issue_status     |
| user_id_raiser   |
| symbol           |
| name             |
| class            |
| is_active        |
| last_price       |
| min_qty          |
| description      |
| logo_url         |
| certification    |
| issuer           |
| project_type     |
| region           |
| commisioned_year |
| credit_unit      |
| total_credit     |
| credit_per_qty   |
| status           |
| image_url_1      |
| image_url_2      |
| image_url_3      |
| image_url_4      |
| image_url_5      |
| certificate_url  |
| map_url          |

## inbox

| column        |
| ------------- |
| user_id_owner |
| message_id    |
| category      |
| subject       |
| message       |
| time          |
| is_read       |

---

# 8. ALUR SISTEM

## Buy Flow

1. User submit buy order
2. Cash diblock
3. Order masuk orderbook
4. Matching engine berjalan
5. Jika matched:

   * trade dibuat
   * blocked cash dilepas
   * portfolio diupdate
   * inbox notification dikirim

## Sell Flow

1. User submit sell order
2. Position quantity diblock
3. Order masuk orderbook
4. Matching engine berjalan
5. Jika matched:

   * trade dibuat
   * blocked stock dilepas
   * account balance diupdate
   * inbox notification dikirim

---

# 9. API ENDPOINT

## Authentication

* login
* google_login
* create_account
* update_account

## Market

* get_market
* get_orderbook
* get_symbol_info
* get_last_price

## Trading

* buy
* sell
* cancel

## Portfolio

* get_portfolio
* get_account

## Issues

* submit_issue
* get_issues
* issue_approval

## Inbox

* get_inbox
* mark_inbox_read

---

# 10. MATCHING ENGINE

Matching engine bekerja berdasarkan:

## Price Priority

* Highest buy priority
* Lowest sell priority

## Time Priority

Jika harga sama:

* order lebih awal diprioritaskan

## Partial Fill

Order dapat matched sebagian.

## Full Fill

Jika quantity terpenuhi penuh maka status menjadi FILLED.

---

# 11. SISTEM PORTFOLIO

Portfolio menghitung:

## Total Owned

Total kepemilikan asset.

## Blocked Quantity

Jumlah asset yang sedang digunakan pada sell order aktif.

## Available Quantity

Jumlah asset yang masih dapat diperdagangkan.

## Unrealized PnL

Selisih market price dengan average price.

---

# 12. SISTEM ISSUES & APPROVAL

User dapat mengajukan project baru melalui endpoint submit_issue.

Issue akan masuk ke database issues.

Admin dapat:

* approve
* reject

Jika approved:

* symbol ditambahkan ke market
* ownership awal diberikan ke issuer

---

# 13. SISTEM INBOX & NOTIFICATION

Inbox digunakan untuk notifikasi sistem.

Kategori:

* warning
* order_notification
* system_notification
* cancelation
* direct_message
* others

Inbox mendukung:

* unread status
* mark as read
* periodic refresh

---

# 14. SISTEM ACCOUNT

Account mendukung:

* profile management
* KYC status
* google authentication
* company profile
* avatar

---

# 15. TEKNOLOGI YANG DIGUNAKAN

## Backend

* Google Apps Script

## Database

* Google Spreadsheet

## Client

* Python
* Web UI

## Communication

* HTTP POST
* JSON payload

---

# 16. FUTURE DEVELOPMENT

Roadmap pengembangan:

* AI-assisted MRV
* advanced analytics
* real-time websocket
* blockchain verification
* mobile application
* institutional dashboard
* ESG scoring
* social trading
* discussion forum
* sustainability news board

---

# 17. TARGET PENGGUNA

GreenExchange ditujukan untuk:

* ESG investor
* renewable developer
* sustainability company
* compliance market
* carbon project issuer
* retail participant
* environmental researcher

---

# 18. CARA MENJALANKAN PROJECT

## Backend

1. Deploy Google Apps Script
2. Hubungkan Spreadsheet database
3. Deploy sebagai Web App
4. Ambil endpoint URL

## Python Client

1. Install Python
2. Install requests
3. Set BASE_URL
4. Jalankan client

---

# 19. ROADMAP

## Phase 1

* Core trading system
* Orderbook
* Portfolio
* Inbox

## Phase 2

* Web UI
* Analytics
* Watchlist
* News integration

## Phase 3

* AI MRV
* Blockchain verification
* Institutional support
* Advanced compliance

---

# 20. PENUTUP

GreenExchange merupakan langkah menuju modernisasi pasar aset lingkungan melalui pendekatan market exchange yang lebih terbuka, transparan, dan scalable.

Dengan menggabungkan sustainability ecosystem dan financial market infrastructure, GreenExchange bertujuan membangun generasi baru marketplace untuk Carbon Credit dan Renewable Energy Certificate.

GREENEXCHANGE
Building the Future Environmental Asset Marketplace
