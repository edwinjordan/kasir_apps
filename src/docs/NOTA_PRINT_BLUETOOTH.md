# Fitur Print Nota Bluetooth - Update NotaPage

## 📋 Update yang Dilakukan

Fitur print Bluetooth telah ditambahkan di halaman Nota (`nota.ts`) untuk memungkinkan print ulang nota transaksi ke printer thermal Bluetooth.

---

## ✨ Fitur Baru

### 1. **Auto Print Prompt**
Setelah memuat nota kecil, sistem otomatis menanyakan apakah user ingin print nota.

### 2. **Auto-Connect ke Printer**
Jika sudah pernah save printer, sistem otomatis connect sebelum print.

### 3. **Pilih Printer**
Jika belum ada printer tersimpan, sistem menampilkan modal untuk pilih printer.

### 4. **Format Nota Thermal**
Nota diformat khusus untuk printer thermal dengan lebar 32 karakter:
- Header dengan nama toko
- Informasi transaksi (No. Faktur, Tanggal, Kasir, Pelanggan)
- Detail items (jika tersedia)
- Total, Subtotal, Diskon
- Footer dengan ucapan terima kasih

---

## 🔧 Method yang Ditambahkan

### 1. `parseNotaHTML(html, notaData)`
Parse HTML nota untuk mendapatkan data yang diperlukan untuk print.

**Return:**
```typescript
{
  storeName: string,
  storeAddress: string,
  noTransaksi: string,
  tanggal: string,
  kasir: string,
  pelanggan: string,
  items: array,
  subtotal: number,
  diskon: number,
  total: number,
  bayar: number,
  kembali: number
}
```

### 2. `printNotaToBluetooth(notaData)`
Main method untuk print nota ke printer Bluetooth.

**Flow:**
1. Cek koneksi printer
2. Auto-connect jika belum connect
3. Format nota
4. Print ke printer
5. Tampilkan hasil (success/error)

### 3. `selectAndPrintNota(notaData)`
Tampilkan modal pilih printer dan print setelah terhubung.

### 4. `formatNotaForPrint(data)`
Format data nota menjadi string yang siap di-print ke thermal printer.

**Features:**
- ESC/POS commands untuk formatting
- Bold text untuk header dan total
- Center align untuk header
- Left align untuk detail
- Currency formatting (Rp)

### 5. Helper Methods
- `formatCurrency(amount)` - Format angka ke format Rupiah
- `padRight(str, length)` - Padding ke kanan dengan spaces
- `padLeft(str, length)` - Padding ke kiri dengan spaces

---

## 🚀 Cara Penggunaan

### User Flow:

1. **Pilih Nota**
   - User memilih nota dari list
   - Pilih "Nota Kecil"

2. **Prompt Print**
   - Sistem menampilkan confirm dialog: "Print Nota?"
   - User pilih Yes/No

3. **Auto-Connect (jika Yes)**
   - Sistem coba connect ke saved printer
   - Jika gagal, tampilkan modal pilih printer

4. **Print**
   - Nota di-format dan dikirim ke printer
   - Tampilkan loading indicator
   - Tampilkan toast notification (success/error)

---

## 📝 Contoh Output Print

```
================================
        TOKO ANDA
    Jl. Contoh No. 123
================================
No. Faktur : TRX001
Tanggal    : 07/11/2025 14:30
Kasir      : Admin
Pelanggan  : Customer A
--------------------------------
Product A
  2 x Rp 15,000      Rp 30,000
Product B
  1 x Rp 25,000      Rp 25,000
--------------------------------
Subtotal   :         Rp 55,000
Diskon     :          Rp 5,000
TOTAL      :         Rp 50,000
Bayar      :        Rp 100,000
Kembali    :         Rp 50,000
================================

      Terima Kasih
    Atas Kunjungan Anda

    07/11/2025 14:30:45



```

---

## 🔄 Update Method Lama

### `listBTDevice()`
- ✅ Updated menggunakan `searchBluetooth()` bukan `searchBt()`
- ✅ Modal dismiss handler di-enable
- ✅ Simpan selected printer

### `testConnectPrinter()`
- ✅ Updated menggunakan `connectToPrinter()` bukan `connectBT()`
- ✅ Menggunakan Promise, bukan Observable
- ✅ Tambah alert jika belum pilih printer

### `testPrinter()`
- ✅ Tambah alert jika belum pilih printer
- ✅ Support `address` dan `id` field

---

## ⚙️ Konfigurasi

### Data yang Digunakan untuk Print

Data diambil dari:
1. **userData** - Informasi toko dan kasir
   - `fc_nmcabang` - Nama toko
   - `fc_alamatcabang` - Alamat toko
   - `fc_nmkaryawan` - Nama kasir

2. **notaData** (dari parameter `c`)
   - `fc_nofaktur` - Nomor faktur
   - `fd_tglfaktur` - Tanggal faktur
   - `fc_nmpelanggan` - Nama pelanggan
   - `fn_subtotal` - Subtotal
   - `fn_diskon` - Diskon
   - `fn_total` - Total
   - `fn_bayar` - Bayar
   - `fn_kembali` - Kembali

3. **Items** - Detail produk
   > ⚠️ **Note:** Items belum diimplementasikan parsing dari HTML.
   > Jika server API `notaGetNotaKecil` tidak return items terpisah,
   > perlu parsing dari HTML atau request API tambahan untuk detail items.

---

## 🐛 Known Issues & Improvements

### Issues:
1. **Items tidak ter-print**
   - `items: []` masih kosong karena belum ada parsing dari HTML
   - Solusi: Perlu API endpoint untuk get detail items, atau parsing HTML

### Improvements Needed:

1. **Parse Items dari HTML**
```typescript
parseNotaHTML(html: string, notaData: any): any {
  // TODO: Parse HTML untuk extract items
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const itemRows = doc.querySelectorAll('.item-row'); // Adjust selector
  
  const items = [];
  itemRows.forEach(row => {
    items.push({
      nama: row.querySelector('.nama').textContent,
      qty: parseInt(row.querySelector('.qty').textContent),
      harga: parseFloat(row.querySelector('.harga').textContent),
      subtotal: parseFloat(row.querySelector('.subtotal').textContent)
    });
  });
  
  return { ...notaData, items };
}
```

2. **API Endpoint untuk Detail Items**
```typescript
// Tambah method di ServerProvider
getNotaDetail(idPenjualan: string) {
  return this.getData('getNotaDetail/' + idPenjualan);
}

// Di NotaPage
this.server.getNotaDetail(c.fn_idpenjualan).then(items => {
  notaData.items = items;
  this.printNotaToBluetooth(notaData);
});
```

3. **Save Last Printed Nota**
```typescript
// Simpan nota terakhir untuk print ulang
private lastPrintedNota: any = null;

async printLastNota() {
  if (this.lastPrintedNota) {
    await this.printNotaToBluetooth(this.lastPrintedNota);
  }
}
```

---

## 📱 UI Additions (Optional)

Tambahkan tombol di `nota.html` untuk fitur tambahan:

```html
<!-- Di ion-item nota -->
<ion-item-options side="right">
  <button ion-button color="secondary" (click)="reprintNota(nota)">
    <ion-icon name="print"></ion-icon>
    Print Ulang
  </button>
</ion-item-options>

<!-- Atau di toolbar -->
<ion-toolbar>
  <button ion-button icon-only (click)="selectPrinter()">
    <ion-icon name="bluetooth"></ion-icon>
  </button>
</ion-toolbar>
```

Dan tambahkan method di `nota.ts`:

```typescript
async reprintNota(nota: any) {
  this.loading = this.pesan.showLoading('Memuat nota...');
  await this.ambilNotaKecil(nota);
}

async selectPrinter() {
  const devices = await this.printProvider.searchBluetooth();
  // ... show modal
}
```

---

## ✅ Testing Checklist

- [ ] Print nota dengan printer connected
- [ ] Print nota tanpa printer (harus prompt pilih printer)
- [ ] Print nota dengan data lengkap
- [ ] Print nota dengan diskon
- [ ] Print nota tanpa pelanggan
- [ ] Test dengan printer 58mm
- [ ] Test dengan printer 80mm
- [ ] Test error handling (printer off, out of paper, dll)

---

## 📚 Related Documentation

- `BLUETOOTH_PRINTER_DOCUMENTATION.md` - Dokumentasi lengkap API
- `BLUETOOTH_PRINTER_QUICK_GUIDE.md` - Quick reference
- `CARA_PAKAI_PRINTER_DI_PENJUALAN.md` - Tutorial integrasi

---

## 🔗 Dependencies

Fitur ini memerlukan:
- ✅ PrintProvider (updated)
- ✅ PrinterListModalPage (updated)
- ✅ PesanProvider (untuk showConfirm, showLoading, showToast)
- ✅ ServerProvider (untuk notaGetNotaKecil)
- ✅ BluetoothSerial plugin

---

**Version:** 1.0.0  
**Last Updated:** 07 November 2025  
**Status:** ✅ Ready to Test

