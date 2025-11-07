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
      this.notaPrintHtml = data;
      //this.printNota('A6');

      // this.showNotaModal = true;
      // data = data.split('<script')[0]
      // this.notaPrint = this.sanitized.bypassSecurityTrustHtml(data);
      // console.log(this.notaPrintHtml, 'notaGetNotaKecil - ambilNotaKecil');
    }).catch(err => {
      this.loading.dismiss();
      console.log(err, 'err notaGetNotaKecil - ambilNotaKecil');
    })
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
    this.printProvider.searchBt().then(datalist=>{

      //1. Open printer select modal
      console.log('datalist', datalist);
      let abc=this.modalCtrl.create(PrinterListModalPage,{data:datalist});

      //2. Printer selected, save into this.selectedPrinter
      // abc.onDidDismiss(data=>{
      //   this.selectedPrinter=data;

      //   let xyz=this.alertCtrl.create({
      //     title: data.name+" selected",
      //     buttons:['Dismiss']
      //   });
      //   xyz.present();

      // });

      // //0. Present Modal
      // abc.present();

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
    var id=this.selectedPrinter.id;
    if(id==null||id==""||id==undefined)
    {
      //nothing happens, you can put an alert here saying no printer selected
    }
    else
    {
      let foo=this.printProvider.connectBT(id).subscribe(data=>{
        console.log("CONNECT SUCCESSFUL",data);

        let mno=this.alertCtrl.create({
          title:"Connect successful",
          buttons:['Dismiss']
        });
        mno.present();

      },err=>{
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
    var id=this.selectedPrinter.id;
    if(id==null||id==""||id==undefined)
    {
      //nothing happens, you can put an alert here saying no printer selected
    }
    else
    {
      let foo=this.printProvider.testPrint(id);
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
