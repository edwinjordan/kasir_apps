import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

/**
 * Generated class for the ReturnPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-return',
  templateUrl: 'return.html',
})
export class ReturnPage {

  textCari;
	pilihanCari = 3;
	dataHasilCari;
  dataHasilCariUi;
	barangNota;
  detailNota;
  userData;
  operator;

	segKeranjang = 'barang';

  showReturn = false;

  pilihReturn;

  modalData;
  modalBarangPilih;
  modalJumlahReturn = 1;
  modalJumlah;
  modalPilihanReturn = 0;
  modalDataKeuangan;
  modalKeuanganPilih;
  modalKeterangan = "";

  simpanLoading = false;

  dataKaryawan;

  showModal = false;

  constructor(
  	public navCtrl: NavController,
  	public server: ServerProvider,
    private pesan: PesanProvider,
    private storage: StorageProvider) {
  }

  ionViewDidLoad() {
     // this.pesan.showToast("Tarik kebawah untuk memuat ulang data produk", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      // console.log("userdata", this.userData)
      this.operator = this.userData;
    })
    this.getAllNota();
    this.getKeuangan();
    this.getKaryawan();
  }

  getAllNota(){
    let l = this.pesan.showLoading('Memuat Data Barang');
    this.server.returnGetDataCari("", 33).then(data => {
      l.dismiss();
      this.dataHasilCari = data;
      // this.dataHasilCari.sort((a,b) =>
      //   // (a.tanggal == b.tanggal)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      //   (a.tanggal == b.tanggal)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari.filter(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi);
      console.log(data)
    }).catch(err => {
      l.dismiss();
      console.log(err);
      this.pesan.showToast('Gagal Memuat Data Nota');
    })
  }

  getKeuangan(){
    this.server.returnAmbilKeuangan().then(data => {
      this.modalDataKeuangan = data;
      this.modalKeuanganPilih = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
    }).catch(err => {
      console.log(err);
    })
  }

  getKaryawan(){
    this.server.getDataKaryawan().then(data => {
      this.dataKaryawan = data;
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Karyawan, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err);
    })
  }

  inputPress(e){
    // if((e.key == "Enter" || e.keyCode == 13)){
    //   if(!this.textCari) {
    //     this.textCari = "";
    //     this.pilihanCari = 33;
    //   }

    //   console.log(this.textCari)
    // 	this.server.returnGetDataCari(this.textCari, this.pilihanCari).then(data => {
    //     this.dataHasilCari = data;
    //     this.dataHasilCari.sort((a,b) => (a.date == b.date)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
    //     console.log(data)
    //   }).catch(err => {
    //     console.log(err)
    //   })
    // }
  }
  cariOnInput(){
    let katCari = this.pilihanCari == 3? 'fc_nofaktur' : this.pilihanCari == 4? 'fc_kdcust' : 'fv_nama';
    if(!this.textCari) this.dataHasilCariUi = this.dataHasilCari;
    this.dataHasilCariUi = this.dataHasilCari.filter(v => {
      // return v[katCari].toLowerCase().includes(this.textCari.toLowerCase());
      return v[katCari]? v[katCari].toLowerCase().includes(this.textCari.toLowerCase()) : false;
    })
  }

  cariOnCancel(){
    this.getAllNota()
  }

  refresh(refresher){
    this.server.returnGetDataCari("", 33).then(data => {
      refresher.complete()
      this.dataHasilCari = data;
      // this.dataHasilCari.sort((a,b) => (a.tanggal == b.tanggal)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari;
      console.log(data)
    }).catch(err => {
      refresher.complete()
      console.log(err);
      this.pesan.showToast('Gagal Memuat Data Nota');
    })

    this.getKeuangan();
    this.getKaryawan();
  }

  pilihNota(c){
    let l = this.pesan.showLoading("Memuat Nota " + c.fc_nofaktur + "...")
  	this.detailNota = c;
    // this.detailNota['id_karyawan_pengambil_nama'] = this.findKaryawan('id_karyawan_pengambil');
    // console.log(this.dataKaryawan.find(x => x.id_karyawan === this.detailNota['id_kary_pembuat_nota']), this.detailNota['id_kary_pembuat_nota']);
    console.log(this.detailNota)
  	this.server.returnGetDataDetail(c.fn_idpenjualan).then(data => {
      this.showModal = true;
  		this.barangNota = data;
      l.dismiss();
      console.log(data);
  	}).catch(err => {
  		console.log(err);
      l.dismiss();
      this.detailNota = null;
  	})
  }

  pilihBarang(bb){
    console.log(bb, 'pilih barang return');
    this.modalData = bb;
    this.modalBarangPilih = bb.barang[0];
    this.showReturn = true;
  }

  tambahJumlah(){
    // cek stok first
    if(this.modalJumlahReturn >= this.modalBarangPilih.qty) return;
    this.modalJumlahReturn  += 1;
  }

  kurangJumlah(){
    if(this.modalJumlahReturn <= 1) return;
    this.modalJumlahReturn -= 1;
  }

  simpanReturn(){
    this.simpanLoading = true;
    let dataKirim = {
      dariAplikasi: true,
      id_detail_penjualane: this.modalData.fn_id,
      // id_barangne33: this.modalData.id_barang,
      fc_kdstock: this.modalData.fc_kdstock,
      fc_kdtipe: this.modalData.fc_kdtipe,
      fc_kdbrand: this.modalData.fc_kdbrand,
      fc_kdgroup: this.modalData.fc_kdgroup,
      fc_kdsatuan: this.modalData.fc_kdsatuan,
      fc_kdarea: this.modalData.fc_kdarea,
      fc_kddivisi: this.modalData.fc_kddivisi,
      fc_kdcust: this.modalData.fc_kdcust,
      qty_detail: this.modalData.barang.length,
      qty_return: this.modalData.fn_qty,
      qty_jml_return: this.modalJumlahReturn,
      input_detail_penjualan_det: this.modalData.fn_id,
      input_max_return: this.modalData.fn_qty,
      fn_idpenjualan: this.modalData.fn_idpenjualan,
      id_detail_penjualane2: this.modalData.fn_id,
      fc_nofaktur: this.modalData.fc_nofaktur,
      date: this.modalData.fd_tglinput,
      id_karyawanne: this.modalData.fc_kdkaryawan,
      jumlah_max: "",
      kode_pelanggane: this.modalData.fc_kdcust,
      jumlah_barang: this.modalData.fn_qty,
      harga_penjualan: this.modalData.fm_price,
      pengembalian: this.modalData.fm_price * this.modalData.fn_qty,
      keterangan_barang: this.modalKeterangan,
     // pilihan: this.modalPilihanReturn,
      kode_nama_keuangan: this.modalKeuanganPilih.kode_nama_keuangan
    }

    console.log(this.modalData);

    this.server.returnSimpan(dataKirim).then(data => {
      data = data.replace(data.substr(0, data.search('{"success"')), '')
      data = JSON.parse(data);
      console.log(data);
      this.simpanLoading = false;
      if(data.success){
        this.pesan.showAlert("Berhasil","Berhasil Return Barang.").then(data => {
        this.modalData = null;
        this.modalBarangPilih = null;
        this.pilihReturn = null;
        this.showReturn = false;
        this.modalPilihanReturn = 0;
        this.pilihNota(this.detailNota);
        // this.detailNota = null;
        // this.barangNota = null;
      });
      }else{
        this.pesan.showToast("Gagal Return Barang", 'bottom', 'danger')
      }
    }).catch(err => {
      console.log(err)
      this.simpanLoading = false;
      this.pesan.showToast("Gagal Return Barang", 'bottom', 'danger')
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
