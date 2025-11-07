import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  userData;
  operator;

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
  	) {

    // this.ambilDataKaryawan();
    // this.ambilDataPelanggan();
    // this.ambilBarangDariServer();
    // this.ambilPotonganPelanggan();
    // this.ambilPotonganMinPembelian();
    // this.ambilPotonganMinPembelianCampuran();
    // this.ambilPotonganPerBarang();
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data produk", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      // console.log("userdata", this.userData)
      this.operator = this.userData;
    })
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
