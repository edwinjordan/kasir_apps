import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  selector: 'page-produk-detail',
  templateUrl: 'produk-detail.html',
})
export class ProdukDetailPage {

  segmentDetailBarang = 'informasi';
  textCari;
  barang;
  varian;
  varianUi;
  campuran;

  showDetail = false;
  dataDetailVarianQty = [];
  dataDetailVarianPelanggan = [];

  segmentModal = 'qty';

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private server: ServerProvider,
    private pesan: PesanProvider) {
  	this.barang = navParams.get('barang');
  }

  ionViewDidLoad() {
    this.ambilDetailbarang();
  }

  ambilDetailbarang(){
    let l = this.pesan.showLoading("Memuat Data Detail Barang");
   // console.log('barang', this.barang);
  	this.server.barangGetDetailBarang(this.barang.fc_kdstock).then(data => {
      l.dismiss();
      this.varian = data.varian;
  		// this.varianUi = data.varian;
  		// this.campuran = data.campuran;
  		console.log(data)
  	}).catch(err => {
      l.dismiss();
      this.pesan.showToast('Gagal Memuat Data Detail Barang');
  		console.log(err);
  	})
  }
}  