# Dokumentasi Fitur Bluetooth Printer

## Daftar Isi
1. [Overview](#overview)
2. [Instalasi & Setup](#instalasi--setup)
3. [Struktur Kode](#struktur-kode)
4. [Cara Penggunaan](#cara-penggunaan)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)
7. [Contoh Implementasi](#contoh-implementasi)

---

## Overview

Fitur Bluetooth Printer memungkinkan aplikasi POS untuk terhubung dan mencetak struk ke printer thermal Bluetooth. Fitur ini menggunakan plugin `@ionic-native/bluetooth-serial` dan mendukung:

- ✅ Pencarian dan koneksi ke printer Bluetooth
- ✅ Menyimpan printer favorit untuk auto-connect
- ✅ Format struk dengan ESC/POS commands
- ✅ Test print
- ✅ Manajemen koneksi (connect, disconnect, reconnect)

---

## Instalasi & Setup

### 1. Plugin yang Diperlukan

Plugin Cordova Bluetooth Serial sudah terinstall di aplikasi:

```json
"@ionic-native/bluetooth-serial": "^5.31.1",
"cordova-plugin-bluetooth-serial": "^0.4.7"
```

### 2. Permissions (Android)

Plugin secara otomatis menambahkan permissions yang diperlukan di `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Untuk Android 6.0+, aplikasi akan meminta izin lokasi saat runtime (diperlukan untuk Bluetooth discovery).

### 3. Provider Setup

PrintProvider sudah terdaftar di `app.module.ts`:

```typescript
import { PrintProvider } from '../providers/print/print';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

// Di providers array
providers: [
  BluetoothSerial,
  PrintProvider,
  // ... providers lainnya
]
```

---

## Struktur Kode

### File Utama

```
src/
├── providers/
│   └── print/
│       └── print.ts              # Service utama untuk Bluetooth printing
├── pages/
│   └── printer-list-modal/
│       ├── printer-list-modal.ts   # Modal pemilihan printer
│       ├── printer-list-modal.html # UI modal
│       └── printer-list-modal.scss # Styling
```

### PrintProvider (`src/providers/print/print.ts`)

Service utama yang menangani:
- Koneksi Bluetooth
- Pencarian perangkat
- Format dan print data
- Manajemen printer tersimpan

---

## Cara Penggunaan

### 1. Mencari Printer Bluetooth

```typescript
import { PrintProvider } from '../../providers/print/print';

constructor(private printProvider: PrintProvider) {}

// Cek apakah Bluetooth aktif
this.printProvider.checkBluetoothEnabled().then(
  () => console.log('Bluetooth enabled'),
  () => this.printProvider.enableBluetooth() // Minta user untuk aktifkan
);

// Dapatkan daftar perangkat yang sudah dipasangkan (paired)
this.printProvider.searchBluetooth().then(devices => {
  console.log('Paired devices:', devices);
  // devices = [{ name: "Printer-BT", address: "00:11:22:33:44:55" }, ...]
});

// Cari perangkat baru (unpaired)
this.printProvider.discoverUnpairedDevices().then(devices => {
  console.log('Unpaired devices:', devices);
});
```

### 2. Koneksi ke Printer

```typescript
// Connect manual
const device = { name: "Printer-BT", address: "00:11:22:33:44:55" };

this.printProvider.connectToPrinter(device).then(success => {
  if (success) {
    console.log('Connected!');
  }
});

// Auto-connect ke printer yang tersimpan
this.printProvider.autoConnect().then(success => {
  if (success) {
    console.log('Auto-connected to saved printer');
  } else {
    console.log('No saved printer or connection failed');
  }
});

// Cek status koneksi
this.printProvider.isBluetoothConnected().then(connected => {
  console.log('Is connected:', connected);
});

// Disconnect
this.printProvider.disconnectBluetooth().then(() => {
  console.log('Disconnected');
});
```

### 3. Mencetak Struk

#### Print Teks Sederhana

```typescript
const text = "Hello World!\n\n\n";
this.printProvider.printText(text);
```

#### Print Struk Terformat

```typescript
const receiptData = {
  storeName: 'TOKO SAYA',
  storeAddress: 'Jl. Contoh No. 123',
  noTransaksi: 'TRX001',
  tanggal: '07/11/2025 14:30',
  kasir: 'Admin',
  items: [
    { nama: 'Produk A', qty: 2, harga: 15000, subtotal: 30000 },
    { nama: 'Produk B', qty: 1, harga: 25000, subtotal: 25000 }
  ],
  subtotal: 55000,
  diskon: 5000,
  total: 50000,
  bayar: 100000,
  kembali: 50000
};

const receipt = this.printProvider.formatReceipt(receiptData);
this.printProvider.printText(receipt);
```

#### Test Print

```typescript
// Print test receipt
const printerAddress = "00:11:22:33:44:55";
this.printProvider.testPrint(printerAddress);
```

### 4. Menggunakan Modal Pemilihan Printer

```typescript
import { ModalController } from 'ionic-angular';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

constructor(
  private modalCtrl: ModalController,
  private printProvider: PrintProvider
) {}

async selectPrinter() {
  // Dapatkan daftar printer
  const devices = await this.printProvider.searchBluetooth();
  
  // Tampilkan modal
  const modal = this.modalCtrl.create(PrinterListModalPage, {
    data: devices
  });
  
  modal.onDidDismiss(selectedDevice => {
    if (selectedDevice) {
      console.log('Printer dipilih:', selectedDevice);
      // Connect ke printer
      this.printProvider.connectToPrinter(selectedDevice);
    }
  });
  
  modal.present();
}
```

### 5. Manajemen Printer Tersimpan

```typescript
// Simpan printer untuk auto-connect
const device = { name: "Printer-BT", address: "00:11:22:33:44:55" };
this.printProvider.savePrinter(device);

// Load printer yang tersimpan
this.printProvider.loadSavedPrinter().then(device => {
  if (device) {
    console.log('Saved printer:', device);
  }
});

// Hapus printer tersimpan
this.printProvider.removeSavedPrinter();

// Get info printer yang sedang terhubung
const connected = this.printProvider.getConnectedDevice();
console.log('Connected device:', connected);
```

---

## API Reference

### PrintProvider Methods

#### Connection Management

| Method | Parameters | Return Type | Description |
|--------|-----------|-------------|-------------|
| `checkBluetoothEnabled()` | - | `Promise<any>` | Cek apakah Bluetooth aktif |
| `enableBluetooth()` | - | `Promise<any>` | Minta user mengaktifkan Bluetooth |
| `searchBluetooth()` | - | `Promise<any[]>` | Dapatkan daftar perangkat paired |
| `discoverUnpairedDevices()` | - | `Promise<any[]>` | Cari perangkat unpaired |
| `connectBluetooth(address)` | `address: string` | `Observable<any>` | Connect ke printer |
| `disconnectBluetooth()` | - | `Promise<any>` | Disconnect dari printer |
| `isBluetoothConnected()` | - | `Promise<boolean>` | Cek status koneksi |
| `connectToPrinter(device)` | `device: any` | `Promise<boolean>` | Connect dengan loading UI |
| `autoConnect()` | - | `Promise<boolean>` | Auto-connect ke saved printer |
| `getConnectedDevice()` | - | `any` | Get info printer terhubung |

#### Printer Storage

| Method | Parameters | Return Type | Description |
|--------|-----------|-------------|-------------|
| `savePrinter(device)` | `device: any` | `Promise<any>` | Simpan printer favorit |
| `loadSavedPrinter()` | - | `Promise<any>` | Load printer tersimpan |
| `removeSavedPrinter()` | - | `Promise<any>` | Hapus printer tersimpan |

#### Printing

| Method | Parameters | Return Type | Description |
|--------|-----------|-------------|-------------|
| `printText(text)` | `text: string` | `Promise<boolean>` | Print teks langsung |
| `testPrint(address)` | `address: string` | `void` | Test print sample receipt |
| `formatReceipt(data)` | `data: any` | `string` | Format data jadi struk |

#### ESC/POS Commands (Constants)

| Constant | Value | Description |
|----------|-------|-------------|
| `ESC_INIT` | `\x1B\x40` | Initialize printer |
| `ESC_ALIGN_LEFT` | `\x1B\x61\x00` | Align text left |
| `ESC_ALIGN_CENTER` | `\x1B\x61\x01` | Align text center |
| `ESC_ALIGN_RIGHT` | `\x1B\x61\x02` | Align text right |
| `ESC_NORMAL` | `\x1B\x21\x00` | Normal text size |
| `ESC_DOUBLE_HEIGHT` | `\x1B\x21\x10` | Double height |
| `ESC_DOUBLE_WIDTH` | `\x1B\x21\x20` | Double width |
| `ESC_DOUBLE_SIZE` | `\x1B\x21\x30` | Double size |
| `ESC_BOLD_ON` | `\x1B\x45\x01` | Bold on |
| `ESC_BOLD_OFF` | `\x1B\x45\x00` | Bold off |
| `ESC_FEED` | `\x1B\x64\x02` | Feed paper |
| `ESC_CUT` | `\x1D\x56\x00` | Cut paper |

### Device Object Structure

```typescript
{
  name: string,        // Nama printer (contoh: "RPP02N")
  address: string,     // MAC address (contoh: "00:11:22:33:44:55")
  id: string,          // ID alternatif
  class?: number       // Device class (optional)
}
```

### Receipt Data Structure

```typescript
{
  storeName: string,      // Nama toko
  storeAddress: string,   // Alamat toko
  noTransaksi: string,    // Nomor transaksi
  tanggal: string,        // Tanggal transaksi
  kasir: string,          // Nama kasir
  items: Array<{          // Daftar item
    nama: string,
    qty: number,
    harga: number,
    subtotal: number
  }>,
  subtotal: number,       // Subtotal sebelum diskon
  diskon?: number,        // Diskon (optional)
  total: number,          // Total bayar
  bayar: number,          // Uang yang dibayarkan
  kembali: number         // Kembalian
}
```

---

## Troubleshooting

### 1. Bluetooth Tidak Aktif

**Problem:** Error saat mencari printer

**Solusi:**
```typescript
this.printProvider.checkBluetoothEnabled().then(
  () => {
    // Bluetooth aktif, lanjutkan
    this.searchPrinters();
  },
  () => {
    // Bluetooth tidak aktif, minta user mengaktifkan
    this.printProvider.enableBluetooth().then(
      () => this.searchPrinters(),
      () => alert('Mohon aktifkan Bluetooth')
    );
  }
);
```

### 2. Printer Tidak Ditemukan

**Kemungkinan Penyebab:**
- Printer belum di-pair di pengaturan Bluetooth
- Printer dalam mode sleep
- Jarak terlalu jauh

**Solusi:**
1. Buka Settings → Bluetooth di perangkat
2. Pair printer secara manual
3. Pastikan printer menyala dan dalam jangkauan
4. Refresh daftar printer di aplikasi

### 3. Koneksi Gagal

**Problem:** `CONNECTION ERROR`

**Solusi:**
```typescript
// Coba reconnect
this.printProvider.disconnectBluetooth().then(() => {
  setTimeout(() => {
    this.printProvider.connectToPrinter(device);
  }, 1000);
});
```

### 4. Print Tidak Keluar

**Problem:** Koneksi sukses tapi tidak print

**Kemungkinan Penyebab:**
- Printer out of paper
- Format ESC/POS tidak kompatibel dengan printer
- Koneksi terputus

**Solusi:**
```typescript
// Cek koneksi dulu
this.printProvider.isBluetoothConnected().then(connected => {
  if (connected) {
    this.printProvider.printText(data);
  } else {
    // Reconnect
    this.printProvider.autoConnect().then(() => {
      this.printProvider.printText(data);
    });
  }
});
```

### 5. Karakters Aneh Tercetak

**Problem:** Karakter tidak terbaca / simbol aneh

**Solusi:**
- Gunakan encoding yang tepat (UTF-8)
- Hindari karakter khusus yang tidak didukung printer
- Gunakan ESC/POS commands yang standar

### 6. Android 12+ Permission Issues

**Problem:** Bluetooth discovery gagal di Android 12+

**Solusi:**
Tambahkan permission di `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

---

## Contoh Implementasi

### Contoh 1: Integrasi di Halaman Penjualan

```typescript
import { Component } from '@angular/core';
import { ModalController, LoadingController } from 'ionic-angular';
import { PrintProvider } from '../../providers/print/print';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

@Component({
  selector: 'page-penjualan',
  templateUrl: 'penjualan.html',
})
export class PenjualanPage {
  
  cart: any[] = [];
  total: number = 0;

  constructor(
    private printProvider: PrintProvider,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewDidLoad() {
    // Auto-connect ke printer saat halaman load
    this.printProvider.autoConnect();
  }

  async printReceipt() {
    const loading = this.loadingCtrl.create({
      content: 'Printing...'
    });
    loading.present();

    // Siapkan data struk
    const receiptData = {
      storeName: 'TOKO SAYA',
      storeAddress: 'Jl. Contoh No. 123',
      noTransaksi: 'TRX' + Date.now(),
      tanggal: new Date().toLocaleString('id-ID'),
      kasir: 'Admin',
      items: this.cart,
      subtotal: this.total,
      total: this.total,
      bayar: this.total,
      kembali: 0
    };

    // Format dan print
    const receipt = this.printProvider.formatReceipt(receiptData);
    const success = await this.printProvider.printText(receipt);

    loading.dismiss();

    if (!success) {
      // Jika gagal, tanya user mau pilih printer?
      const shouldSelectPrinter = confirm('Print gagal. Pilih printer?');
      if (shouldSelectPrinter) {
        this.selectPrinter();
      }
    }
  }

  async selectPrinter() {
    try {
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
    } catch (error) {
      alert('Error mencari printer: ' + error);
    }
  }

  testPrint() {
    const device = this.printProvider.getConnectedDevice();
    if (device) {
      this.printProvider.testPrint(device.address);
    } else {
      alert('Belum terhubung ke printer');
    }
  }
}
```

### Contoh 2: Settings Page untuk Printer

```typescript
import { Component } from '@angular/core';
import { PrintProvider } from '../../providers/print/print';
import { ModalController } from 'ionic-angular';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  
  savedPrinter: any = null;
  isConnected: boolean = false;

  constructor(
    private printProvider: PrintProvider,
    private modalCtrl: ModalController
  ) {}

  ionViewDidLoad() {
    this.loadPrinterInfo();
  }

  async loadPrinterInfo() {
    this.savedPrinter = await this.printProvider.loadSavedPrinter();
    this.isConnected = await this.printProvider.isBluetoothConnected();
  }

  async selectPrinter() {
    const devices = await this.printProvider.searchBluetooth();
    
    const modal = this.modalCtrl.create(PrinterListModalPage, {
      data: devices
    });

    modal.onDidDismiss(async device => {
      if (device) {
        const success = await this.printProvider.connectToPrinter(device);
        if (success) {
          this.loadPrinterInfo();
        }
      }
    });

    modal.present();
  }

  async disconnect() {
    await this.printProvider.disconnectBluetooth();
    this.loadPrinterInfo();
  }

  async reconnect() {
    if (this.savedPrinter) {
      await this.printProvider.connectToPrinter(this.savedPrinter);
      this.loadPrinterInfo();
    }
  }

  async forgetPrinter() {
    await this.printProvider.removeSavedPrinter();
    await this.printProvider.disconnectBluetooth();
    this.savedPrinter = null;
    this.isConnected = false;
  }

  testPrint() {
    if (this.savedPrinter) {
      this.printProvider.testPrint(this.savedPrinter.address);
    }
  }
}
```

```html
<!-- settings.html -->
<ion-header>
  <ion-navbar>
    <ion-title>Printer Settings</ion-title>
  </ion-navbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item-divider>Printer Bluetooth</ion-item-divider>
    
    <ion-item *ngIf="savedPrinter">
      <ion-icon name="bluetooth" item-start [color]="isConnected ? 'secondary' : 'medium'"></ion-icon>
      <h2>{{ savedPrinter.name }}</h2>
      <p>{{ savedPrinter.address }}</p>
      <ion-badge item-end [color]="isConnected ? 'secondary' : 'light'">
        {{ isConnected ? 'Terhubung' : 'Terputus' }}
      </ion-badge>
    </ion-item>

    <ion-item *ngIf="!savedPrinter">
      <p>Belum ada printer tersimpan</p>
    </ion-item>

    <button ion-button full (click)="selectPrinter()">
      <ion-icon name="search"></ion-icon>
      Pilih Printer
    </button>

    <button ion-button full outline (click)="testPrint()" [disabled]="!savedPrinter">
      <ion-icon name="print"></ion-icon>
      Test Print
    </button>

    <button ion-button full color="secondary" (click)="reconnect()" 
            [disabled]="!savedPrinter || isConnected">
      <ion-icon name="refresh"></ion-icon>
      Reconnect
    </button>

    <button ion-button full color="light" (click)="disconnect()" 
            [disabled]="!isConnected">
      <ion-icon name="close-circle"></ion-icon>
      Disconnect
    </button>

    <button ion-button full color="danger" (click)="forgetPrinter()" 
            [disabled]="!savedPrinter">
      <ion-icon name="trash"></ion-icon>
      Hapus Printer
    </button>
  </ion-list>
</ion-content>
```

### Contoh 3: Format Struk Custom dengan ESC/POS

```typescript
customReceipt() {
  let receipt = '';
  
  // Initialize printer
  receipt += this.printProvider.ESC_INIT;
  
  // Header - Center, Bold, Double Size
  receipt += this.printProvider.ESC_ALIGN_CENTER;
  receipt += this.printProvider.ESC_BOLD_ON;
  receipt += this.printProvider.ESC_DOUBLE_SIZE;
  receipt += 'TOKO SAYA\n';
  
  // Back to normal
  receipt += this.printProvider.ESC_NORMAL;
  receipt += this.printProvider.ESC_BOLD_OFF;
  receipt += 'Jl. Contoh No. 123\n';
  receipt += 'Telp: 08123456789\n';
  
  // Line separator
  receipt += this.printProvider.ESC_ALIGN_LEFT;
  receipt += '--------------------------------\n';
  
  // Transaction details - Left align
  receipt += 'No: TRX001\n';
  receipt += 'Tgl: 07/11/2025 14:30\n';
  receipt += '--------------------------------\n';
  
  // Items
  receipt += 'Produk A\n';
  receipt += '  2 x 15,000       30,000\n';
  receipt += 'Produk B\n';
  receipt += '  1 x 25,000       25,000\n';
  receipt += '--------------------------------\n';
  
  // Total - Bold
  receipt += this.printProvider.ESC_BOLD_ON;
  receipt += 'TOTAL:             55,000\n';
  receipt += this.printProvider.ESC_BOLD_OFF;
  
  // Footer
  receipt += this.printProvider.ESC_ALIGN_CENTER;
  receipt += '\nTerima Kasih\n';
  
  // Feed and cut
  receipt += this.printProvider.ESC_FEED;
  receipt += this.printProvider.ESC_CUT;
  
  // Print
  this.printProvider.printText(receipt);
}
```

---

## Best Practices

### 1. Error Handling
Selalu tangani error dengan try-catch atau .catch():
```typescript
try {
  await this.printProvider.printText(data);
} catch (error) {
  console.error('Print error:', error);
  // Show user-friendly message
}
```

### 2. Connection Management
- Auto-connect saat app start
- Reconnect otomatis jika terputus
- Simpan printer favorit user

### 3. User Experience
- Tampilkan loading indicator saat connecting/printing
- Berikan feedback yang jelas (success/error)
- Sediakan tombol test print
- Tampilkan status koneksi

### 4. Performance
- Cache daftar printer
- Jangan scan Bluetooth terlalu sering
- Disconnect saat tidak digunakan untuk hemat battery

### 5. Testing
Test di berbagai kondisi:
- ✅ Printer menyala
- ✅ Printer mati
- ✅ Bluetooth off
- ✅ Out of paper
- ✅ Jarak jauh
- ✅ Koneksi terputus saat print

---

## Changelog

### Version 1.0.0 (07/11/2025)
- ✅ Initial implementation
- ✅ Bluetooth connection management
- ✅ Printer search & discovery
- ✅ Save/load printer settings
- ✅ Receipt formatting
- ✅ ESC/POS commands support
- ✅ Test print feature
- ✅ Auto-connect feature
- ✅ PrinterListModal with improved UI

---

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

**Supported Printers:**
- Thermal Printer 58mm
- Thermal Printer 80mm
- ESC/POS compatible printers
- Most Bluetooth thermal printers

**Tested Devices:**
- Android 6.0+
- Ionic 3.9.2
- Cordova Android 8.0.0

---

## License

Internal use only - Viyon Apps

