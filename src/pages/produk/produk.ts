import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProdukDetailPage } from '../produk-detail/produk-detail';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  selector: 'page-produk',
  templateUrl: 'produk.html'
})
export class ProdukPage {

  textCari;
  dataBarang;
  userData;
  operator;
	dataBarangUi = [];
	dataKelompok = [];
	dataSubKelompok = [];

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private pesan: PesanProvider,
    private storage: StorageProvider) {
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data produk", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      // console.log("userdata", this.userData)
      this.operator = this.userData;
    })
    this.getDataBarang();
  }


  getDataBarang(){
    let l = this.pesan.showLoading('Memuat Data Barang');
  	this.server.barangGetDataBarang().then(data => {
      l.dismiss();
      console.log(data)
  		// this.dataKelompok = data.kelompok;
  		// this.dataSubKelompok = data.sub_kelompok;

  		this.dataBarang = data.barang.filter(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi);
      //   let nama_kelompok = this.dataKelompok.find(vv => vv.id_kelompok == v.id_kelompok)
      //   if(nama_kelompok){
  		// 	  v.nama_kelompok = nama_kelompok.nama_kelompok
      //   }
      //   let nama_subkelompok = this.dataSubKelompok.find(vv => vv.id_sub_kelompok == v.id_sub_kelompok);
      //   if(nama_subkelompok){
  		// 	  v.nama_subkelompok = nama_subkelompok.nama_sub_kelompok;
      //   }
  		// 	return v;
  		// });
      if(this.textCari) return;
      this.dataBarangUi = this.dataBarang;
      console.log(this.dataBarang);
  	}).catch(err => {
      l.dismiss();
      this.pesan.showToast('Gagal Memuat Data Barang');
  		console.log(err);
  	})
  }

  cariOnInput(){
    if(!this.textCari || this.textCari == '') return this.dataBarangUi = this.dataBarang;
    this.dataBarangUi = this.dataBarang.filter(v => {
      return v.fc_kdstock.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fc_barcode.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fv_namastock.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fv_nmtipe.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fv_nmbrand.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fv_nmgroup.toLowerCase().includes(this.textCari.toLowerCase())
    })
  }

  cariOnCancel(){
    this.dataBarangUi = this.dataBarang;
  }

  refresh(refresher){
    this.server.barangGetDataBarang().then(data => {
      refresher.complete();
      console.log(data)
      // this.dataKelompok = data.kelompok;
      // this.dataSubKelompok = data.sub_kelompok;

      this.dataBarang = data.barang;
      if(this.textCari) return;
      this.dataBarangUi = this.dataBarang;
      console.log(this.dataBarang);
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast('Gagal Memuat Data Barang');
      console.log(err);
    })
  }

  detailBarang(i){
  	this.navCtrl.push(ProdukDetailPage, {
  		barang: this.dataBarangUi[i]
  	});
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
