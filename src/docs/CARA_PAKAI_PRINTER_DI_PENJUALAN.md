# Cara Menggunakan Bluetooth Printer di Halaman Penjualan

## Langkah-langkah Integrasi

### 1. Import yang Diperlukan

Tambahkan di file `penjualan.ts`:

\`\`\`typescript
import { PrintProvider } from '../../providers/print/print';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';
import { ModalController } from 'ionic-angular';
\`\`\`

### 2. Inject di Constructor

\`\`\`typescript
constructor(
  // ... constructor lain yang sudah ada
  private printProvider: PrintProvider,
  private modalCtrl: ModalController
) {}
\`\`\`

### 3. Auto-Connect saat Halaman Load

Tambahkan di method `ionViewDidLoad()` atau buat method baru:

\`\`\`typescript
ionViewDidLoad() {
  // ... kode lain yang sudah ada
  
  // Auto-connect ke printer
  this.printProvider.autoConnect().then(connected => {
    if (connected) {
      console.log('Auto-connected to printer');
    }
  });
}
\`\`\`

### 4. Tambahkan Method untuk Pilih Printer

\`\`\`typescript
async selectPrinter() {
  try {
    const devices = await this.printProvider.searchBluetooth();
    
    const modal = this.modalCtrl.create(PrinterListModalPage, {
      data: devices
    });

    modal.onDidDismiss(async device => {
      if (device) {
        const success = await this.printProvider.connectToPrinter(device);
        if (success) {
          // Printer terhubung
          console.log('Connected to:', device.name);
        }
      }
    });

    modal.present();
  } catch (error) {
    console.error('Error selecting printer:', error);
  }
}
\`\`\`

### 5. Method untuk Print Struk Setelah Transaksi

\`\`\`typescript
async printReceipt(transaksiData: any) {
  // Format data sesuai dengan struktur data Anda
  const receiptData = {
    storeName: 'TOKO ANDA',  // Bisa dari this.userData
    storeAddress: 'Alamat toko',
    noTransaksi: transaksiData.no_transaksi,
    tanggal: transaksiData.tanggal,
    kasir: this.userData.fc_nmkaryawan,  // Dari user data
    items: transaksiData.items.map(item => ({
      nama: item.fc_nmproduk,
      qty: item.fi_qty,
      harga: item.fn_harga,
      subtotal: item.fn_subtotal
    })),
    subtotal: transaksiData.fn_subtotal,
    diskon: transaksiData.fn_diskon || 0,
    total: transaksiData.fn_total,
    bayar: transaksiData.fn_bayar,
    kembali: transaksiData.fn_kembali
  };

  // Format dan print
  const receipt = this.printProvider.formatReceipt(receiptData);
  const success = await this.printProvider.printText(receipt);

  if (!success) {
    // Jika gagal, tanya user mau pilih printer
    const retry = confirm('Print gagal. Pilih printer lain?');
    if (retry) {
      await this.selectPrinter();
      // Retry print
      await this.printProvider.printText(receipt);
    }
  }
}
\`\`\`

### 6. Panggil Method Print Setelah Save Transaksi

Di method save/submit transaksi Anda:

\`\`\`typescript
simpanTransaksi() {
  // ... kode save transaksi yang sudah ada
  
  this.server.postData(body, 'saveTransaksi').subscribe(res => {
    if (res.success) {
      // Print struk
      this.printReceipt(this.transaksiData);
      
      // ... kode lainnya (reset form, navigasi, dll)
    }
  });
}
\`\`\`

### 7. Tambahkan Tombol di HTML

Tambahkan di file `penjualan.html`:

\`\`\`html
<!-- Tombol untuk pilih printer (optional, bisa di settings) -->
<button ion-button icon-left (click)="selectPrinter()">
  <ion-icon name="bluetooth"></ion-icon>
  Pilih Printer
</button>

<!-- Tombol print ulang (optional) -->
<button ion-button icon-left (click)="printLastReceipt()">
  <ion-icon name="print"></ion-icon>
  Print Ulang
</button>
\`\`\`

## Contoh Lengkap untuk Halaman Penjualan

\`\`\`typescript
import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController } from 'ionic-angular';
import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PrintProvider } from '../../providers/print/print';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

@Component({
  selector: 'page-penjualan',
  templateUrl: 'penjualan.html',
})
export class PenjualanPage {
  
  userData: any;
  cart: any[] = [];
  total: number = 0;
  lastTransaksi: any = null;

  constructor(
    public navCtrl: NavController,
    private server: ServerProvider,
    private storage: StorageProvider,
    private printProvider: PrintProvider,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewDidLoad() {
    this.loadUserData();
    this.autoConnectPrinter();
  }

  async loadUserData() {
    this.userData = await this.storage.getStorage('user:data');
  }

  async autoConnectPrinter() {
    const connected = await this.printProvider.autoConnect();
    if (connected) {
      console.log('Printer connected automatically');
    }
  }

  // Method untuk pilih printer
  async selectPrinter() {
    try {
      const devices = await this.printProvider.searchBluetooth();
      
      const modal = this.modalCtrl.create(PrinterListModalPage, {
        data: devices
      });

      modal.onDidDismiss(async device => {
        if (device) {
          await this.printProvider.connectToPrinter(device);
        }
      });

      modal.present();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Simpan transaksi dan print
  async simpanTransaksi() {
    const loading = this.loadingCtrl.create({
      content: 'Menyimpan transaksi...'
    });
    loading.present();

    const body = {
      items: this.cart,
      total: this.total,
      kasir: this.userData.fc_kdkaryawan
      // ... data lainnya
    };

    this.server.postData(body, 'saveTransaksi').subscribe(
      async (res) => {
        loading.dismiss();
        
        if (res.success) {
          // Simpan data transaksi terakhir
          this.lastTransaksi = res.data;
          
          // Print struk
          await this.printReceipt(res.data);
          
          // Reset form
          this.resetForm();
          
          alert('Transaksi berhasil!');
        }
      },
      (error) => {
        loading.dismiss();
        console.error('Error:', error);
      }
    );
  }

  // Print struk
  async printReceipt(transaksi: any) {
    const receiptData = {
      storeName: 'TOKO ANDA',
      storeAddress: 'Jl. Contoh No. 123',
      noTransaksi: transaksi.no_transaksi,
      tanggal: new Date().toLocaleString('id-ID'),
      kasir: this.userData.fc_nmkaryawan,
      items: this.cart.map(item => ({
        nama: item.fc_nmproduk,
        qty: item.qty,
        harga: item.harga,
        subtotal: item.qty * item.harga
      })),
      subtotal: this.total,
      diskon: transaksi.diskon || 0,
      total: this.total - (transaksi.diskon || 0),
      bayar: transaksi.bayar,
      kembali: transaksi.kembali
    };

    const receipt = this.printProvider.formatReceipt(receiptData);
    const success = await this.printProvider.printText(receipt);

    if (!success) {
      const retry = confirm('Print gagal. Coba lagi dengan printer lain?');
      if (retry) {
        await this.selectPrinter();
      }
    }
  }

  // Print ulang transaksi terakhir
  async printLastReceipt() {
    if (this.lastTransaksi) {
      await this.printReceipt(this.lastTransaksi);
    } else {
      alert('Tidak ada transaksi untuk di-print');
    }
  }

  resetForm() {
    this.cart = [];
    this.total = 0;
  }
}
\`\`\`

## Tips

1. **Auto-connect saat app start**: Panggil `autoConnect()` di `app.component.ts` agar printer selalu siap
2. **Simpan referensi transaksi**: Simpan data transaksi terakhir untuk fitur print ulang
3. **Handle error**: Selalu tangani error dengan user-friendly message
4. **Loading indicator**: Tampilkan loading saat printing untuk UX yang lebih baik
5. **Settings page**: Buat halaman settings khusus untuk manage printer

## Struktur Data yang Perlu Disesuaikan

Sesuaikan field-field berikut dengan struktur database Anda:

\`\`\`typescript
// Contoh mapping
items: this.cart.map(item => ({
  nama: item.nama_produk,        // Sesuaikan dengan field Anda
  qty: item.jumlah,              // Sesuaikan dengan field Anda
  harga: item.harga_satuan,      // Sesuaikan dengan field Anda
  subtotal: item.total           // Sesuaikan dengan field Anda
}))
\`\`\`

## Troubleshooting

**Print tidak keluar setelah save transaksi?**
- Cek koneksi printer dengan `isBluetoothConnected()`
- Cek apakah `printText()` dipanggil setelah response dari server

**Ingin print otomatis setelah transaksi?**
- Panggil `printReceipt()` di dalam callback success save transaksi
- Jangan tunggu user klik tombol print

**Ingin optional print (user bisa skip)?**
\`\`\`typescript
const shouldPrint = confirm('Print struk?');
if (shouldPrint) {
  await this.printReceipt(transaksi);
}
\`\`\`

