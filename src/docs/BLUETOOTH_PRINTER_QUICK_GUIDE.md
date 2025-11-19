# Quick Guide: Bluetooth Printer

## Setup Cepat

### 1. Import PrintProvider
```typescript
import { PrintProvider } from '../../providers/print/print';

constructor(private printProvider: PrintProvider) {}
```

### 2. Pilih Printer
```typescript
// Cari printer
const devices = await this.printProvider.searchBluetooth();

// Connect
await this.printProvider.connectToPrinter(device);

// atau Auto-connect ke saved printer
await this.printProvider.autoConnect();
```

### 3. Print
```typescript
// Print sederhana
await this.printProvider.printText("Hello World!\n\n\n");

// Print struk
const data = {
  storeName: 'TOKO SAYA',
  noTransaksi: 'TRX001',
  tanggal: '07/11/2025',
  kasir: 'Admin',
  items: [
    { nama: 'Item 1', qty: 2, harga: 10000, subtotal: 20000 }
  ],
  total: 20000,
  bayar: 50000,
  kembali: 30000
};

const receipt = this.printProvider.formatReceipt(data);
await this.printProvider.printText(receipt);
```

## Methods Penting

| Method | Fungsi |
|--------|--------|
| `searchBluetooth()` | Cari printer paired |
| `connectToPrinter(device)` | Connect ke printer |
| `autoConnect()` | Auto-connect ke saved printer |
| `printText(text)` | Print teks |
| `formatReceipt(data)` | Format data jadi struk |
| `testPrint(address)` | Test print |
| `savePrinter(device)` | Simpan printer favorit |
| `disconnectBluetooth()` | Disconnect |

## Troubleshooting

**Printer tidak ditemukan?**
- Pastikan Bluetooth aktif
- Pair printer di Settings → Bluetooth
- Refresh daftar printer

**Print gagal?**
```typescript
// Coba reconnect
await this.printProvider.autoConnect();
await this.printProvider.printText(data);
```

**Karakters aneh?**
- Hindari karakter khusus
- Gunakan encoding UTF-8

## Dokumentasi Lengkap

Lihat [BLUETOOTH_PRINTER_DOCUMENTATION.md](./BLUETOOTH_PRINTER_DOCUMENTATION.md) untuk detail lengkap.

