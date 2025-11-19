import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController, Platform } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { StorageProvider } from '../storage/storage';

@Injectable()
export class PrintProvider {

  private connectedDevice: any = null;
  private isConnected: boolean = false;

  constructor(
    private btSerial: BluetoothSerial,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: StorageProvider,
    private platform: Platform
  ) {
    // Load saved printer on initialization
    this.loadSavedPrinter();
  }

  /**
   * Check if Bluetooth is enabled on the device
   */
  checkBluetoothEnabled() {
    if (this.platform.is('cordova')) {
      return this.btSerial.isEnabled();
    } else {
      // Mock enabled in browser
      return Promise.resolve(true);
    }
  }

  /**
   * Enable Bluetooth
   */
  enableBluetooth() {
    if (this.platform.is('cordova')) {
      return this.btSerial.enable();
    } else {
      // Mock enable in browser
      return Promise.resolve(true);
    }
  }

  /**
   * Search for available Bluetooth devices
   */
  searchBluetooth() {
    if (this.platform.is('cordova')) {
      return this.btSerial.list();
    } else {
      // Mock data for browser testing
      return Promise.resolve([
        { name: 'Mock Printer 1', address: '00:11:22:33:44:55', id: '00:11:22:33:44:55' },
        { name: 'Mock Printer 2', address: '00:11:22:33:44:56', id: '00:11:22:33:44:56' }
      ]);
    }
  }

  /**
   * Search for unpaired Bluetooth devices
   */
  discoverUnpairedDevices() {
    if (this.platform.is('cordova')) {
      return this.btSerial.discoverUnpaired();
    } else {
      // Mock data for browser testing
      return Promise.resolve([
        { name: 'Mock Unpaired Printer', address: '00:11:22:33:44:57', id: '00:11:22:33:44:57' }
      ]);
    }
  }

  /**
   * Connect to a Bluetooth printer
   * @param address - MAC address of the printer
   */
  connectBluetooth(address: string) {
    if (this.platform.is('cordova')) {
      return this.btSerial.connect(address);
    } else {
      // Mock connection in browser
      console.log('Mock connecting to:', address);
      return new Promise((resolve) => {
        setTimeout(() => resolve({ connected: true }), 500);
      }) as any;
    }
  }

  /**
   * Disconnect from current Bluetooth printer
   */
  disconnectBluetooth() {
    this.isConnected = false;
    this.connectedDevice = null;
    if (this.platform.is('cordova')) {
      return this.btSerial.disconnect();
    } else {
      // Mock disconnect in browser
      console.log('Mock disconnecting');
      return Promise.resolve(true);
    }
  }

  /**
   * Check if currently connected to a printer
   */
  isBluetoothConnected() {
    if (this.platform.is('cordova')) {
      return this.btSerial.isConnected();
    } else {
      // Mock connected state in browser
      return Promise.resolve(this.isConnected);
    }
  }

  /**
   * Get connected device info
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * Save printer to local storage for auto-connect
   * @param device - Printer device info
   */
  savePrinter(device: any) {
    return this.storage.setStorage('saved:printer', device);
  }

  /**
   * Load saved printer from storage
   */
  loadSavedPrinter() {
    return this.storage.getStorage('saved:printer').then(device => {
      if (device) {
        this.connectedDevice = device;
      }
      return device;
    });
  }

  /**
   * Remove saved printer
   */
  removeSavedPrinter() {
    this.connectedDevice = null;
    return this.storage.removeStorage('saved:printer');
  }

  /**
   * Connect to printer with loading indicator
   * @param device - Printer device object
   */
  async connectToPrinter(device: any) {
    const loading = this.loadingCtrl.create({
      content: 'Connecting to printer...'
    });
    loading.present();

    try {
      if (this.platform.is('cordova')) {
        await this.connectBluetooth(device.address || device.id).toPromise();
      } else {
        // Mock connection in browser
        console.log('Mock connecting to device:', device);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      this.connectedDevice = device;
      this.isConnected = true;
      await this.savePrinter(device);
      
      loading.dismiss();
      this.showToast('Connected to ' + device.name, 'success');
      return true;
    } catch (error) {
      loading.dismiss();
      this.showAlert('Connection Failed', 'Could not connect to printer: ' + error);
      return false;
    }
  }

  /**
   * Auto-connect to saved printer
   */
  async autoConnect() {
    const savedPrinter = await this.loadSavedPrinter();
    if (savedPrinter) {
      return await this.connectToPrinter(savedPrinter);
    }
    return false;
  }

  /**
   * Print text data
   * @param text - Text to print
   */
  async printText(text: string) {
    if (!this.isConnected && !this.connectedDevice) {
      this.showAlert('Not Connected', 'Please connect to a printer first');
      return false;
    }

    try {
      // Ensure connected
      const connected = await this.isBluetoothConnected();
      if (!connected) {
        // Try to reconnect
        await this.connectToPrinter(this.connectedDevice);
      }

      if (this.platform.is('cordova')) {
        await this.btSerial.write(text).then(data => {
          console.log('Print success:', data);
          this.showToast('Print successful', 'success');
        });
      } else {
        // Mock print in browser - log to console
        console.log('=== MOCK PRINT OUTPUT ===');
        console.log(text);
        console.log('=== END PRINT OUTPUT ===');
        this.showToast('Mock print successful (check console)', 'success');
      }
      return true;
    } catch (error) {
      console.error('Print error:', error);
      this.showAlert('Print Failed', 'Could not print: ' + error);
      return false;
    }
  }

  /**
   * Test print with sample data
   * @param address - Printer MAC address
   */
  testPrint(address: string) {
    const printData = this.formatTestReceipt();

    if (this.platform.is('cordova')) {
      const subscription = this.connectBluetooth(address).subscribe(
        data => {
          this.btSerial.write(printData).then(
            response => {
              console.log('WRITE SUCCESS', response);
              this.showAlert('Print SUCCESS!', 'Test print completed successfully');
              subscription.unsubscribe();
            },
            error => {
              console.log('WRITE FAILED', error);
              this.showAlert('Print Error', 'Failed to print: ' + error);
            }
          );
        },
        error => {
          console.log('CONNECTION ERROR', error);
          this.showAlert('Connection Error', 'Could not connect to printer: ' + error);
        }
      );
    } else {
      // Mock test print in browser
      console.log('=== MOCK TEST PRINT ===');
      console.log(printData);
      console.log('=== END TEST PRINT ===');
      this.showAlert('Mock Test Print', 'Check console for output. This will work on real device.');
    }
  }

  /**
   * Format test receipt
   */
  private formatTestReceipt(): string {
    let receipt = '';
    receipt += this.center('=================================\n');
    receipt += this.center('TEST PRINT\n');
    receipt += this.center('=================================\n');
    receipt += '\n';
    receipt += 'Test Item 1                 10,000\n';
    receipt += 'Test Item 2                 20,000\n';
    receipt += 'Test Item 3                 30,000\n';
    receipt += this.center('---------------------------------\n');
    receipt += 'TOTAL:                      60,000\n';
    receipt += this.center('=================================\n');
    receipt += '\n';
    receipt += this.center('Thank You!\n');
    receipt += '\n\n\n\n';
    return receipt;
  }

  /**
   * Center align text (for 32 character thermal printer)
   * @param text - Text to center
   */
  private center(text: string): string {
    const width = 32;
    const spaces = Math.floor((width - text.length) / 2);
    return ' '.repeat(spaces > 0 ? spaces : 0) + text;
  }

  /**
   * Format receipt for printing
   * @param data - Receipt data object
   */
  formatReceipt(data: any): string {
    let receipt = '';
    
    // Header
    receipt += this.center('=================================\n');
    receipt += this.center((data.storeName || 'TOKO') + '\n');
    receipt += this.center((data.storeAddress || '') + '\n');
    receipt += this.center('=================================\n');
    receipt += '\n';
    
    // Transaction info
    receipt += 'No. Trans : ' + (data.noTransaksi || '-') + '\n';
    receipt += 'Tanggal   : ' + (data.tanggal || '-') + '\n';
    receipt += 'Kasir     : ' + (data.kasir || '-') + '\n';
    receipt += this.center('---------------------------------\n');
    receipt += '\n';
    
    // Items
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        receipt += item.nama + '\n';
        receipt += '  ' + item.qty + ' x ' + this.formatCurrency(item.harga);
        receipt += '      ' + this.formatCurrency(item.subtotal) + '\n';
      });
    }
    
    receipt += this.center('---------------------------------\n');
    
    // Totals
    receipt += 'Subtotal  : ' + this.formatCurrency(data.subtotal || 0) + '\n';
    if (data.diskon) {
      receipt += 'Diskon    : ' + this.formatCurrency(data.diskon) + '\n';
    }
    receipt += 'TOTAL     : ' + this.formatCurrency(data.total || 0) + '\n';
    receipt += 'Bayar     : ' + this.formatCurrency(data.bayar || 0) + '\n';
    receipt += 'Kembali   : ' + this.formatCurrency(data.kembali || 0) + '\n';
    
    receipt += this.center('=================================\n');
    receipt += '\n';
    receipt += this.center('Terima Kasih\n');
    receipt += this.center('Atas Kunjungan Anda\n');
    receipt += '\n\n\n\n';
    
    return receipt;
  }

  /**
   * Format currency for printing
   */
  private formatCurrency(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  /**
   * Show alert dialog
   */
  private showAlert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      cssClass: type === 'success' ? 'toast-success' : 'toast-error'
    });
    toast.present();
  }

  /**
   * Print ESC/POS commands for formatting
   */
  
  // Initialize printer
  ESC_INIT = '\x1B\x40';
  
  // Text alignment
  ESC_ALIGN_LEFT = '\x1B\x61\x00';
  ESC_ALIGN_CENTER = '\x1B\x61\x01';
  ESC_ALIGN_RIGHT = '\x1B\x61\x02';
  
  // Text size
  ESC_NORMAL = '\x1B\x21\x00';
  ESC_DOUBLE_HEIGHT = '\x1B\x21\x10';
  ESC_DOUBLE_WIDTH = '\x1B\x21\x20';
  ESC_DOUBLE_SIZE = '\x1B\x21\x30';
  
  // Text style
  ESC_BOLD_ON = '\x1B\x45\x01';
  ESC_BOLD_OFF = '\x1B\x45\x00';
  ESC_UNDERLINE_ON = '\x1B\x2D\x01';
  ESC_UNDERLINE_OFF = '\x1B\x2D\x00';
  
  // Feed and cut
  ESC_FEED = '\x1B\x64\x02';
  ESC_CUT = '\x1D\x56\x00';

}
