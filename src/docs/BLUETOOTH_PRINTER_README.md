# 📱 Viyon POS App - Bluetooth Printer Feature

## 📋 Overview

Fitur Bluetooth Printer telah ditambahkan ke aplikasi Viyon POS untuk mendukung pencetakan struk ke printer thermal Bluetooth. Fitur ini lengkap dengan manajemen koneksi, format struk otomatis, dan antarmuka yang user-friendly.

---

## 🚀 Fitur yang Ditambahkan

### ✅ Core Features
- **Bluetooth Connection Management**
  - Scan & discover printer Bluetooth
  - Connect/disconnect otomatis
  - Simpan printer favorit untuk auto-connect
  - Status monitoring koneksi real-time

- **Printing Capabilities**
  - Print teks sederhana
  - Format struk otomatis (auto-format receipt)
  - ESC/POS commands support
  - Test print feature
  - Custom formatting dengan ESC/POS

- **User Interface**
  - Modal pemilihan printer yang intuitif
  - List perangkat paired & unpaired
  - Status indikator koneksi
  - Loading states & error handling

---

## 📁 File-File yang Dimodifikasi/Ditambahkan

### Modified Files
```
src/providers/print/print.ts                          ✅ UPDATED
src/pages/printer-list-modal/printer-list-modal.ts   ✅ UPDATED
src/pages/printer-list-modal/printer-list-modal.html ✅ UPDATED
```

### New Files Created
```
📄 Documentation Files:
├── BLUETOOTH_PRINTER_DOCUMENTATION.md       ← Dokumentasi lengkap & detail
├── BLUETOOTH_PRINTER_QUICK_GUIDE.md         ← Quick reference guide
├── CARA_PAKAI_PRINTER_DI_PENJUALAN.md      ← Tutorial integrasi di halaman penjualan
└── src/pages/printer-demo/printer-demo.ts   ← Demo page untuk testing
```

---

## 📚 Dokumentasi

### 1. **BLUETOOTH_PRINTER_DOCUMENTATION.md** (Dokumentasi Lengkap)
   - Overview fitur
   - Instalasi & setup
   - Struktur kode
   - API Reference lengkap
   - Troubleshooting
   - Contoh implementasi
   - Best practices

### 2. **BLUETOOTH_PRINTER_QUICK_GUIDE.md** (Quick Reference)
   - Setup cepat 3 langkah
   - Methods penting
   - Common troubleshooting

### 3. **CARA_PAKAI_PRINTER_DI_PENJUALAN.md** (Tutorial Integrasi)
   - Step-by-step integrasi di halaman penjualan
   - Contoh kode lengkap
   - Mapping struktur data
   - Tips & tricks

---

## 🎯 Quick Start

### Langkah 1: Import PrintProvider

```typescript
import { PrintProvider } from '../../providers/print/print';

constructor(private printProvider: PrintProvider) {}
```

### Langkah 2: Connect ke Printer

```typescript
// Auto-connect saat app start
ionViewDidLoad() {
  this.printProvider.autoConnect();
}

// Atau manual selection
async selectPrinter() {
  const devices = await this.printProvider.searchBluetooth();
  // Tampilkan modal untuk pilih printer
}
```

### Langkah 3: Print Struk

```typescript
const data = {
  storeName: 'TOKO SAYA',
  noTransaksi: 'TRX001',
  tanggal: '07/11/2025',
  items: [...],
  total: 50000
};

const receipt = this.printProvider.formatReceipt(data);
await this.printProvider.printText(receipt);
```

---

## 🔧 API Methods (PrintProvider)

### Connection
| Method | Description |
|--------|-------------|
| `searchBluetooth()` | Cari printer Bluetooth paired |
| `connectToPrinter(device)` | Connect ke printer |
| `autoConnect()` | Auto-connect ke saved printer |
| `disconnectBluetooth()` | Disconnect dari printer |
| `isBluetoothConnected()` | Cek status koneksi |

### Printing
| Method | Description |
|--------|-------------|
| `printText(text)` | Print teks langsung |
| `formatReceipt(data)` | Format data jadi struk |
| `testPrint(address)` | Test print sample |

### Storage
| Method | Description |
|--------|-------------|
| `savePrinter(device)` | Simpan printer favorit |
| `loadSavedPrinter()` | Load printer tersimpan |
| `removeSavedPrinter()` | Hapus printer tersimpan |

---

## 💡 Contoh Penggunaan

### Di Halaman Penjualan

```typescript
import { PrintProvider } from '../../providers/print/print';

export class PenjualanPage {
  constructor(private printProvider: PrintProvider) {}

  async simpanTransaksi() {
    // Save transaksi ke server
    const res = await this.server.saveTransaksi(data);
    
    // Print struk
    if (res.success) {
      const receipt = this.printProvider.formatReceipt({
        storeName: 'TOKO ANDA',
        noTransaksi: res.noTransaksi,
        items: this.cart,
        total: this.total,
        // ...
      });
      
      await this.printProvider.printText(receipt);
    }
  }
}
```

### Modal Pemilihan Printer

```typescript
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

async pilihPrinter() {
  const devices = await this.printProvider.searchBluetooth();
  
  const modal = this.modalCtrl.create(PrinterListModalPage, {
    data: devices
  });

  modal.onDidDismiss(device => {
    if (device) {
      this.printProvider.connectToPrinter(device);
    }
  });

  modal.present();
}
```

---

## 🐛 Troubleshooting

### Printer tidak ditemukan?
1. Pastikan Bluetooth aktif
2. Pair printer di Settings → Bluetooth
3. Nyalakan printer
4. Refresh daftar printer

### Print gagal?
```typescript
// Auto-retry dengan reconnect
const success = await this.printProvider.printText(data);
if (!success) {
  await this.printProvider.autoConnect();
  await this.printProvider.printText(data);
}
```

### Karakter aneh tercetak?
- Gunakan encoding UTF-8
- Hindari karakter khusus
- Gunakan ESC/POS commands standar

---

## 📦 Dependencies

```json
{
  "@ionic-native/bluetooth-serial": "^5.31.1",
  "cordova-plugin-bluetooth-serial": "^0.4.7"
}
```

---

## ✅ Checklist Integrasi

Untuk mengintegrasikan di halaman Anda:

- [ ] Import `PrintProvider` di component
- [ ] Inject di constructor
- [ ] Panggil `autoConnect()` di `ionViewDidLoad()`
- [ ] Format data transaksi sesuai struktur `ReceiptData`
- [ ] Panggil `formatReceipt()` dan `printText()` setelah save transaksi
- [ ] Tambahkan error handling
- [ ] Test dengan printer fisik

---

## 🎨 UI Components

### PrinterListModal
- ✅ Daftar printer paired
- ✅ Search unpaired devices
- ✅ Test print button
- ✅ Status indicator (connected/saved)
- ✅ Refresh button
- ✅ Petunjuk penggunaan

### Printer Demo Page
- ✅ Status monitoring
- ✅ Connection controls
- ✅ Test print buttons
- ✅ Sample receipts
- ✅ Custom formatting demo

---

## 🔐 Permissions (Android)

Otomatis ditambahkan oleh plugin:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Untuk Android 12+:
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

---

## 📱 Tested On

- ✅ Android 6.0+
- ✅ Ionic 3.9.2
- ✅ Thermal Printer 58mm
- ✅ Thermal Printer 80mm
- ✅ ESC/POS compatible printers

---

## 📖 Read More

Untuk informasi lengkap, baca dokumentasi berikut:

1. **BLUETOOTH_PRINTER_DOCUMENTATION.md** - Complete documentation
2. **BLUETOOTH_PRINTER_QUICK_GUIDE.md** - Quick reference
3. **CARA_PAKAI_PRINTER_DI_PENJUALAN.md** - Integration tutorial

---

## 🤝 Support

Untuk pertanyaan atau issue:
- Baca dokumentasi lengkap terlebih dahulu
- Check troubleshooting section
- Contact development team

---

## 📝 Notes

- **Auto-connect**: Printer yang tersimpan akan otomatis connect saat app start
- **Saved Printer**: Hanya 1 printer yang bisa disimpan sebagai default
- **Format Struk**: Lebar default 32 karakter (sesuaikan jika perlu)
- **ESC/POS**: Gunakan constants yang tersedia untuk formatting

---

## ✨ Version

**Version:** 1.0.0  
**Release Date:** 07 November 2025  
**Status:** ✅ Production Ready

---

**Happy Printing! 🖨️**

