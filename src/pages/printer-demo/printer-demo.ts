import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import { PrintProvider } from '../../providers/print/print';
import { PrinterListModalPage } from '../printer-list-modal/printer-list-modal';

/**
 * Halaman Demo/Testing Printer Bluetooth
 * Gunakan halaman ini untuk testing fitur printer
 */
@Component({
  selector: 'page-printer-demo',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Printer Demo</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content padding>
      <!-- Printer Status -->
      <ion-card>
        <ion-card-header>
          Status Printer
        </ion-card-header>
        <ion-card-content>
          <ion-item *ngIf="connectedDevice">
            <ion-icon name="bluetooth" item-start color="secondary"></ion-icon>
            <h2>{{ connectedDevice.name }}</h2>
            <p>{{ connectedDevice.address }}</p>
            <ion-badge item-end color="secondary">Terhubung</ion-badge>
          </ion-item>
          <ion-item *ngIf="!connectedDevice">
            <ion-icon name="bluetooth" item-start color="medium"></ion-icon>
            <p>Belum terhubung ke printer</p>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Actions -->
      <ion-card>
        <ion-card-header>
          Actions
        </ion-card-header>
        <ion-card-content>
          <button ion-button full (click)="selectPrinter()">
            <ion-icon name="search"></ion-icon>
            Pilih Printer
          </button>
          
          <button ion-button full outline (click)="autoConnect()" [disabled]="!savedPrinter">
            <ion-icon name="sync"></ion-icon>
            Auto Connect
          </button>
          
          <button ion-button full color="light" (click)="disconnect()" [disabled]="!connectedDevice">
            <ion-icon name="close-circle"></ion-icon>
            Disconnect
          </button>
        </ion-card-content>
      </ion-card>

      <!-- Test Print -->
      <ion-card>
        <ion-card-header>
          Test Print
        </ion-card-header>
        <ion-card-content>
          <button ion-button full color="secondary" (click)="testPrint()" [disabled]="!connectedDevice">
            <ion-icon name="print"></ion-icon>
            Test Print
          </button>
          
          <button ion-button full color="secondary" outline (click)="printSampleReceipt()" [disabled]="!connectedDevice">
            <ion-icon name="receipt"></ion-icon>
            Print Sample Receipt
          </button>
          
          <button ion-button full color="secondary" outline (click)="printCustom()" [disabled]="!connectedDevice">
            <ion-icon name="create"></ion-icon>
            Print Custom Format
          </button>
        </ion-card-content>
      </ion-card>

      <!-- Info -->
      <ion-card>
        <ion-card-header>
          Info
        </ion-card-header>
        <ion-card-content>
          <p><strong>Saved Printer:</strong> {{ savedPrinter ? savedPrinter.name : 'None' }}</p>
          <p><strong>Bluetooth Enabled:</strong> {{ bluetoothEnabled ? 'Yes' : 'No' }}</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class PrinterDemoPage {
  
  connectedDevice: any = null;
  savedPrinter: any = null;
  bluetoothEnabled: boolean = false;

  constructor(
    public navCtrl: NavController,
    private printProvider: PrintProvider,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewDidLoad() {
    this.checkStatus();
  }

  async checkStatus() {
    // Check Bluetooth
    try {
      await this.printProvider.checkBluetoothEnabled();
      this.bluetoothEnabled = true;
    } catch (e) {
      this.bluetoothEnabled = false;
    }

    // Load saved printer
    this.savedPrinter = await this.printProvider.loadSavedPrinter();
    
    // Get connected device
    this.connectedDevice = this.printProvider.getConnectedDevice();
  }

  async selectPrinter() {
    const loading = this.loadingCtrl.create({
      content: 'Searching printers...'
    });
    loading.present();

    try {
      const devices = await this.printProvider.searchBluetooth();
      loading.dismiss();

      const modal = this.modalCtrl.create(PrinterListModalPage, {
        data: devices
      });

      modal.onDidDismiss(async (device) => {
        if (device) {
          const success = await this.printProvider.connectToPrinter(device);
          if (success) {
            this.checkStatus();
          }
        }
      });

      modal.present();
    } catch (error) {
      loading.dismiss();
      alert('Error: ' + error);
    }
  }

  async autoConnect() {
    const success = await this.printProvider.autoConnect();
    if (success) {
      this.checkStatus();
    } else {
      alert('Auto-connect failed. Please select printer manually.');
    }
  }

  async disconnect() {
    await this.printProvider.disconnectBluetooth();
    this.connectedDevice = null;
  }

  testPrint() {
    if (this.connectedDevice) {
      this.printProvider.testPrint(this.connectedDevice.address);
    }
  }

  async printSampleReceipt() {
    const data = {
      storeName: 'TOKO DEMO',
      storeAddress: 'Jl. Contoh No. 123, Jakarta',
      noTransaksi: 'DEMO' + Date.now(),
      tanggal: new Date().toLocaleString('id-ID'),
      kasir: 'Admin Demo',
      items: [
        { nama: 'Product A - Sample Item 1', qty: 2, harga: 15000, subtotal: 30000 },
        { nama: 'Product B - Sample Item 2', qty: 1, harga: 25000, subtotal: 25000 },
        { nama: 'Product C - Sample Item 3', qty: 3, harga: 10000, subtotal: 30000 }
      ],
      subtotal: 85000,
      diskon: 5000,
      total: 80000,
      bayar: 100000,
      kembali: 20000
    };

    const receipt = this.printProvider.formatReceipt(data);
    await this.printProvider.printText(receipt);
  }

  async printCustom() {
    let text = '';
    
    // Init
    text += this.printProvider.ESC_INIT;
    
    // Header
    text += this.printProvider.ESC_ALIGN_CENTER;
    text += this.printProvider.ESC_DOUBLE_SIZE;
    text += this.printProvider.ESC_BOLD_ON;
    text += 'CUSTOM PRINT\n';
    text += this.printProvider.ESC_NORMAL;
    text += this.printProvider.ESC_BOLD_OFF;
    
    // Content
    text += this.printProvider.ESC_ALIGN_LEFT;
    text += '================================\n';
    text += 'This is a custom formatted print\n';
    text += 'with ESC/POS commands\n';
    text += '================================\n\n';
    
    // Bold text
    text += this.printProvider.ESC_BOLD_ON;
    text += 'Bold Text\n';
    text += this.printProvider.ESC_BOLD_OFF;
    text += 'Normal Text\n\n';
    
    // Double size
    text += this.printProvider.ESC_DOUBLE_SIZE;
    text += 'BIG TEXT\n';
    text += this.printProvider.ESC_NORMAL;
    
    // Center
    text += this.printProvider.ESC_ALIGN_CENTER;
    text += '\nCentered Text\n';
    
    // Right
    text += this.printProvider.ESC_ALIGN_RIGHT;
    text += 'Right Aligned\n';
    
    // Footer
    text += this.printProvider.ESC_ALIGN_CENTER;
    text += '\n--- END ---\n';
    text += this.printProvider.ESC_FEED;
    
    await this.printProvider.printText(text);
  }
}
