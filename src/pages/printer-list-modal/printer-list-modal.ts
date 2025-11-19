import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { PrintProvider } from '../../providers/print/print';

@IonicPage()
@Component({
  selector: 'page-printer-list-modal',
  templateUrl: 'printer-list-modal.html',
})
export class PrinterListModalPage {
  printerList: any = [];
  unpairedDevices: any = [];
  isSearching: boolean = false;
  savedPrinter: any = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private printProvider: PrintProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
  }

  ionViewDidLoad() {
    this.printerList = this.navParams.get('data') || [];
    this.loadSavedPrinter();
  }

  /**
   * Load saved printer from storage
   */
  async loadSavedPrinter() {
    this.savedPrinter = await this.printProvider.loadSavedPrinter();
  }

  /**
   * Select a printer from the list
   */
  select(device: any) {
    this.viewCtrl.dismiss(device);
  }

  /**
   * Test print on selected device
   */
  async testPrint(device: any, event: any) {
    event.stopPropagation();
    
    const loading = this.loadingCtrl.create({
      content: 'Testing printer...'
    });
    loading.present();

    try {
      await this.printProvider.testPrint(device.address || device.id);
      loading.dismiss();
    } catch (error) {
      loading.dismiss();
      const alert = this.alertCtrl.create({
        title: 'Test Failed',
        message: 'Could not test printer: ' + error,
        buttons: ['OK']
      });
      alert.present();
    }
  }

  /**
   * Search for unpaired devices
   */
  searchUnpairedDevices() {
    this.isSearching = true;
    const loading = this.loadingCtrl.create({
      content: 'Searching for devices...'
    });
    loading.present();

    this.printProvider.discoverUnpairedDevices().then(
      devices => {
        this.unpairedDevices = devices || [];
        loading.dismiss();
        this.isSearching = false;
      },
      error => {
        loading.dismiss();
        this.isSearching = false;
        const alert = this.alertCtrl.create({
          title: 'Search Failed',
          message: 'Could not search for devices: ' + error,
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  /**
   * Refresh paired devices list
   */
  refreshList() {
    const loading = this.loadingCtrl.create({
      content: 'Refreshing...'
    });
    loading.present();

    this.printProvider.searchBluetooth().then(
      devices => {
        this.printerList = devices || [];
        loading.dismiss();
      },
      error => {
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Refresh Failed',
          message: 'Could not refresh list: ' + error,
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  /**
   * Check if device is saved
   */
  isSavedPrinter(device: any): boolean {
    if (!this.savedPrinter) return false;
    return this.savedPrinter.address === device.address || 
           this.savedPrinter.id === device.id;
  }

  /**
   * Close modal
   */
  close() {
    this.viewCtrl.dismiss();
  }

}
