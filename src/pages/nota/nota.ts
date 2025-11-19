import { Component } from '@angular/core';
import { NavController, Platform, ModalController,AlertController } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';
import {PrintProvider} from '../../providers/print/print';
import {PrinterListModalPage} from '../printer-list-modal/printer-list-modal';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

declare const cordova;

@Component({
  selector: 'page-nota',
  templateUrl: 'nota.html'
})
export class NotaPage {

  dataHasilCari;
  dataHasilCariUi;
  pilihanCari = 3;
  textCari;
  notaPilih;
  notaPrint;
  notaPrintHtml;
  userData;
  operator;

  showNotaModal = false;

  loading;
  selectedPrinter:any=[];

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private server: ServerProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
    // private printer: Printer,
    private storage: StorageProvider,
    private printProvider:PrintProvider,
    private modalCtrl:ModalController,
    private alertCtrl:AlertController
    ) {
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data nota", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      // console.log("userdata", this.userData)
      this.operator = this.userData;
    })
    this.getAllNota();
  }


  getAllNota(){
    let l = this.pesan.showLoading('Memuat Data Barang');
    this.server.returnGetDataCari("", 33).then(data => {
      l.dismiss();
      this.dataHasilCari = data;
      // this.dataHasilCari.sort((a,b) => (a.date == b.date)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari.filter(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi);
      console.log(data, 'getAllNota - NotaPage');
    }).catch(err => {
      l.dismiss();
      console.log(err);
      this.pesan.showToast("Galal Memuat Data Nota");
    })
  }

  inputPress(e){
  }
  cariOnInput(){
    let katCari = this.pilihanCari == 3? 'no_faktur' : this.pilihanCari == 4? 'kode_pelanggan' : 'nama';
    this.dataHasilCariUi = this.dataHasilCari.filter(v => {
      return v[katCari].toLowerCase().includes(this.textCari.toLowerCase());
    })
  }
  cariOnCancel(){
    this.getAllNota()
  }

  refresh(refresher){
    this.server.returnGetDataCari("", 33).then(data => {
      refresher.complete();
      this.dataHasilCari = data;
     // this.dataHasilCari.sort((a,b) => (a.date == b.date)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari;
      console.log(data, 'getAllNota - NotaPage');
    }).catch(err => {
      refresher.complete();
      console.log(err);
      this.pesan.showToast("Galal Memuat Data Nota");
    })
  }

  pilihNota(c){
    console.log(c, 'pilihNota - NotaPage');
    this.notaPrint = null;
    this.notaPilih = c;
    let option = [{
      name: 'notakecil',
      value: 'notakecil',
      type: 'radio',
      label: 'Nota Kecil',
      checked: true
    }];
    this.pesan.showOption("Pilih Jenis Nota", option).then(data => {
      if(!data.data) return;
      this.loading = this.pesan.showLoading('Memuat Nota ' + c.fc_nofaktur);
      if(data.data == 'notakecil'){
        this.ambilNotaKecil(c);
      }
    }).catch(err => {
      console.log(err);
    })

  }

  ambilNotaKecil(c){

    this.server.notaGetNotaKecil(c.fn_idpenjualan).then(data => {
      this.loading.dismiss();
      this.notaPrintHtml = data;
      
      // Parse HTML data untuk mendapatkan informasi nota
      const notaData = this.parseNotaHTML(data, c);
      
      // Tanya user mau print atau tidak
      this.pesan.showConfirm('Print Nota?', 'Apakah Anda ingin print nota ini ke printer Bluetooth?').then(shouldPrint => {
        if (shouldPrint) {
          this.printNotaToBluetooth(notaData);
        }
      });

      // this.showNotaModal = true;
      // data = data.split('<script')[0]
      // this.notaPrint = this.sanitized.bypassSecurityTrustHtml(data);
      // console.log(this.notaPrintHtml, 'notaGetNotaKecil - ambilNotaKecil');
    }).catch(err => {
      this.loading.dismiss();
      console.log(err, 'err notaGetNotaKecil - ambilNotaKecil');
      this.pesan.showToast('Gagal memuat nota');
    })
  }

  /**
   * Parse HTML nota untuk mendapatkan data yang diperlukan
   */
  parseNotaHTML(html: string, notaData: any): any {
    // Untuk sementara kita gunakan data yang ada dari notaData
    // Nanti bisa diparsing dari HTML jika diperlukan
    return {
      storeName: this.userData.fc_nmcabang || 'TOKO',
      storeAddress: this.userData.fc_alamatcabang || '',
      noTransaksi: notaData.fc_nofaktur,
      tanggal: notaData.fd_tglfaktur,
      kasir: this.userData.fc_nmkaryawan,
      pelanggan: notaData.fc_nmpelanggan || '-',
      // Items akan diambil dari server atau parsing HTML
      items: [],
      subtotal: parseFloat(notaData.fn_subtotal) || 0,
      diskon: parseFloat(notaData.fn_diskon) || 0,
      total: parseFloat(notaData.fn_total) || 0,
      bayar: parseFloat(notaData.fn_bayar) || 0,
      kembali: parseFloat(notaData.fn_kembali) || 0
    };
  }

  /**
   * Print nota ke printer Bluetooth
   */
  async printNotaToBluetooth(notaData: any) {
    // Cek apakah sudah terhubung ke printer
    const isConnected = await this.printProvider.isBluetoothConnected();
    
    if (!isConnected) {
      // Coba auto-connect ke saved printer
      const autoConnected = await this.printProvider.autoConnect();
      
      if (!autoConnected) {
        // Jika gagal, tampilkan modal pilih printer
        this.pesan.showConfirm('Printer Belum Terhubung', 'Pilih printer Bluetooth?').then(async shouldSelect => {
          if (shouldSelect) {
            await this.selectAndPrintNota(notaData);
          }
        });
        return;
      }
    }

    // Print nota
    const loading = this.pesan.showLoading('Printing nota...');
    
    try {
      const receipt = this.formatNotaForPrint(notaData);
      const success = await this.printProvider.printText(receipt);
      
      loading.dismiss();
      
      if (success) {
        this.pesan.showToast('Nota berhasil di-print', 'top', 'success');
      } else {
        this.pesan.showToast('Gagal print nota', 'top', 'danger');
      }
    } catch (error) {
      loading.dismiss();
      console.error('Error printing nota:', error);
      this.pesan.showToast('Error: ' + error, 'top', 'danger');
    }
  }

  /**
   * Pilih printer dan print nota
   */
  async selectAndPrintNota(notaData: any) {
    try {
      const devices = await this.printProvider.searchBluetooth();
      
      const modal = this.modalCtrl.create(PrinterListModalPage, {
        data: devices
      });

      modal.onDidDismiss(async (device) => {
        if (device) {
          const loading = this.pesan.showLoading('Connecting to printer...');
          const connected = await this.printProvider.connectToPrinter(device);
          loading.dismiss();
          
          if (connected) {
            // Print setelah terhubung
            this.printNotaToBluetooth(notaData);
          } else {
            this.pesan.showToast('Gagal terhubung ke printer', 'top', 'danger');
          }
        }
      });

      modal.present();
    } catch (error) {
      console.error('Error selecting printer:', error);
      this.pesan.showToast('Error: ' + error, 'top', 'danger');
    }
  }

  /**
   * Format nota untuk print thermal
   */
  formatNotaForPrint(data: any): string {
    let receipt = '';
    
    // Initialize printer
    receipt += this.printProvider.ESC_INIT;
    
    // Header - Center, Bold
    receipt += this.printProvider.ESC_ALIGN_CENTER;
    receipt += this.printProvider.ESC_BOLD_ON;
    receipt += this.printProvider.ESC_DOUBLE_SIZE;
    receipt += (data.storeName || 'TOKO') + '\n';
    receipt += this.printProvider.ESC_NORMAL;
    receipt += this.printProvider.ESC_BOLD_OFF;
    
    // Store Address
    if (data.storeAddress) {
      receipt += data.storeAddress + '\n';
    }
    receipt += '================================\n';
    
    // Transaction Info - Left align
    receipt += this.printProvider.ESC_ALIGN_LEFT;
    receipt += 'No. Faktur : ' + (data.noTransaksi || '-') + '\n';
    receipt += 'Tanggal    : ' + (data.tanggal || '-') + '\n';
    receipt += 'Kasir      : ' + (data.kasir || '-') + '\n';
    
    if (data.pelanggan && data.pelanggan !== '-') {
      receipt += 'Pelanggan  : ' + data.pelanggan + '\n';
    }
    
    receipt += '--------------------------------\n';
    
    // Items
    if (data.items && data.items.length > 0) {
      data.items.forEach((item: any) => {
        receipt += item.nama + '\n';
        receipt += '  ' + item.qty + ' x ' + this.formatCurrency(item.harga);
        receipt += this.padRight(this.formatCurrency(item.subtotal), 15) + '\n';
      });
    } else {
      receipt += 'Detail item tidak tersedia\n';
    }
    
    receipt += '--------------------------------\n';
    
    // Totals
    receipt += 'Subtotal   : ' + this.padLeft(this.formatCurrency(data.subtotal), 18) + '\n';
    
    if (data.diskon > 0) {
      receipt += 'Diskon     : ' + this.padLeft(this.formatCurrency(data.diskon), 18) + '\n';
    }
    
    receipt += this.printProvider.ESC_BOLD_ON;
    receipt += 'TOTAL      : ' + this.padLeft(this.formatCurrency(data.total), 18) + '\n';
    receipt += this.printProvider.ESC_BOLD_OFF;
    
    if (data.bayar > 0) {
      receipt += 'Bayar      : ' + this.padLeft(this.formatCurrency(data.bayar), 18) + '\n';
      receipt += 'Kembali    : ' + this.padLeft(this.formatCurrency(data.kembali), 18) + '\n';
    }
    
    receipt += '================================\n';
    
    // Footer
    receipt += this.printProvider.ESC_ALIGN_CENTER;
    receipt += '\nTerima Kasih\n';
    receipt += 'Atas Kunjungan Anda\n';
    receipt += '\n';
    receipt += new Date().toLocaleString('id-ID') + '\n';
    
    // Feed and cut
    receipt += '\n\n\n';
    receipt += this.printProvider.ESC_FEED;
    
    return receipt;
  }

  /**
   * Format currency untuk print
   */
  private formatCurrency(amount: number): string {
    if (!amount) return 'Rp 0';
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  /**
   * Pad string ke kanan dengan spaces
   */
  private padRight(str: string, length: number): string {
    return str + ' '.repeat(Math.max(0, length - str.length));
  }

  /**
   * Pad string ke kiri dengan spaces
   */
  private padLeft(str: string, length: number): string {
    return ' '.repeat(Math.max(0, length - str.length)) + str;
  }

  // ambilNotaBesar(c){
  //   this.server.notaGetNotaBesar(c.id_penjualan).then(data => {
  //     this.notaPrintHtml = data;
  //     this.printNota('A4');

  //     // this.showNotaModal = true;
  //     // data = data.split('<script')[0]
  //     // this.notaPrint = this.sanitized.bypassSecurityTrustHtml(data);
  //     // console.log(this.notaPrintHtml, 'notaGetNotaBesar - ambilNotaBesar');
  //   }).catch(err => {
  //     this.loading.dismiss();
  //     console.log(err, 'err notaGetNotaBesar - ambilNotaBesar');
  //   })
  // }

  // printNota(ukuran){
  //   if(this.platform.is('cordova')){
  //     this.printer.print(this.notaPrintHtml).then(data => {
  //       console.log(data, 'print');
  //       this.loading.dismiss();
  //     }).catch(err => {
  //       console.log(err, 'err print');
  //       this.loading.dismiss();
  //     })
  //   }else{
  //     this.loading.dismiss();
  //     this.pesan.showToast("device tidak mendukung print")
  //   }
  // }

  listBTDevice()
  {
    this.printProvider.searchBluetooth().then(datalist=>{

      //1. Open printer select modal
      console.log('datalist', datalist);
      let abc=this.modalCtrl.create(PrinterListModalPage,{data:datalist});

      abc.onDidDismiss(data=>{
        if (data) {
          this.selectedPrinter = data;
          let xyz = this.alertCtrl.create({
            title: data.name + " selected",
            buttons: ['Dismiss']
          });
          xyz.present();
        }
      });

      abc.present();

    },err=>{
      console.log("ERROR",err);
      let mno=this.alertCtrl.create({
        title:"ERROR "+err,
        buttons:['Dismiss']
      });
      mno.present();
    })

  }

  testConnectPrinter()
  {
    var id=this.selectedPrinter.id || this.selectedPrinter.address;
    if(id==null||id==""||id==undefined)
    {
      let mno=this.alertCtrl.create({
        title:"No printer selected",
        message: "Please select a printer first",
        buttons:['Dismiss']
      });
      mno.present();
    }
    else
    {
      this.printProvider.connectToPrinter(this.selectedPrinter).then(success => {
        if (success) {
          let mno=this.alertCtrl.create({
            title:"Connect successful",
            buttons:['Dismiss']
          });
          mno.present();
        }
      }).catch(err => {
        console.log("Not able to connect",err);
        let mno=this.alertCtrl.create({
          title:"ERROR "+err,
          buttons:['Dismiss']
        });
        mno.present();
      });
    }
  }

  testPrinter()
  {
    var id=this.selectedPrinter.id || this.selectedPrinter.address;
    if(id==null||id==""||id==undefined)
    {
      let mno=this.alertCtrl.create({
        title:"No printer selected",
        message: "Please select a printer first",
        buttons:['Dismiss']
      });
      mno.present();
    }
    else
    {
      this.printProvider.testPrint(id);
    }
  }

  setting(){
    this.pesan.changeServerUrl().then(data => {
      console.log(data, 'changeServerUrl - setting - LoginPage');
      this.server.setServerUrl(data);
    }).catch(err => {
      console.log(err, 'err changeServerUrl - setting - LoginPage')
    })
  }
}
