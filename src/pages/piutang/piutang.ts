import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-piutang',
  templateUrl: 'piutang.html',
})
export class PiutangPage {

  userData;
  textCari
  nota;
  notaUi;
  notaPilih;
  jenisKeuanganUI = [];
  jenisKeuanganDebitUI = [];

  showPembayaran = false;

  segPembayaran = 'Bayar'
  jenisPembayaran: any = 0;
  potonganPembayaran = 0;
  jenisKeuangan;
  ketReturn;
  bayarKeuangan = 0;
  jenisKeuanganDebit;
  bayarKeuanganDebit = 0;
  jenisKeuanganTransfer;
  bayarKeuanganTransfer = 0;

  bayarReturn = 0;

  kembalianKekurangan = 0;

  ekspedisi = false;
  namaEkspedisi = "";
  noResi = "";
  biayaEkspedisi = 0;

  bayarLoading = false;

  modalShow = false;

  loadingPrint;
  notaPrintHtml;

  uang = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

  gunakanSaldo = false;
  gunakanReturn = false;
  saldo = 0;
  biaya_return= 0;
  //keterangan;

  c = true;
  r = true;
  u = true;
  d = true;

  constructor(
    private platform: Platform,
  	private navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private printer: Printer,
    private sanitized: DomSanitizer
  ) {
  }

  ionViewDidLoad() {
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      console.log("userdata", this.userData)
    //   let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'piutang'))];
    //   this.c = submenuPembayaran.c == '1';
    //   this.r = submenuPembayaran.r == '1';
    //   this.u = submenuPembayaran.u == '1';
    //   this.d = submenuPembayaran.d == '1';
      this.ambilDataNota();
    })
    // this.ambilDataNota();
     this.ambilKeuangan();
  }

  ambilDataNota(){
    let l = this.pesan.showLoading('Memuat Data Piutang');
  	this.server.pembayaranGetDataNotaPiutang().then(data => {
      // if(!this.c || !this.u) {
      //   data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      // }
      this.nota = data;
      this.notaUi = this.nota;
      l.dismiss();
      console.log(data);
    }).catch(err => {
      console.log(err)
      l.dismiss()
    })
  }

  ambilKeuangan(){
    this.server.returnAmbilKeuangan().then(data => {
      this.jenisKeuanganUI = data;
      // this.jenisKeuangan = data;
      this.jenisKeuangan = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
     // console.log(data, data.findIndex(x => x.nama_keuangan.toLowerCase() === "kasir"))
    }).catch(err => {
      console.log(err)
    })
  }

  refresh(refresher){
    this.server.pembayaranGetDataNotaPiutang().then(data => {
      // if(!this.c || !this.u) {
      //   data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      // }
      this.nota = data;
      this.notaUi = this.nota;
      refresher.complete()
      console.log(data);
    }).catch(err => {
      console.log(err)
      refresher.complete()
    });
    this.ambilKeuangan();
    //this.ambilKeuanganDebit();
  }

  cariOnInput(){
    if(!this.textCari || this.textCari == '') return this.notaUi = this.nota;
    this.notaUi = this.nota.filter(v => {
      return v.fc_nofaktur.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fc_kdcust.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.fv_nama.toLowerCase().includes(this.textCari.toLowerCase())
    })
  }

  cariOnCancel(){
    this.notaUi = this.nota;
  }

  pembayaran(){
      this.showPembayaran = true;
    //  let loading = this.pesan.showLoading('Memuat Data !!!');
    //  this.saldo = 0;
    //  this.server.pembayaranGetSaldoPenjualan(this.notaPilih.fc_kdcust).then(data => {
    //   //this.notaPilih['saldo_pelanggan'] = data? Number(data.saldo) : 0;
    //   //this.saldo = this.notaPilih.saldo_pelanggan;
    //   //this.gunakanSaldo = this.saldo > 0? true : false;
    //   loading.dismiss();

    //  // console.log(this.saldo);
    // }).catch(err => {
    //   loading.dismiss();
    // //   this.notaPilih['saldo_pelanggan'] = 0;
    // //   this.saldo = 0;
    //   this.pesan.showAlert("", "Gagal Memuat Data Return");
    // })

    // // this.saldo = 0;

  }

  bayar(){
    this.bayarLoading = true;
    // console.log('this.jenisKeuangan',this.jenisKeuangan);
    // console.log('this.jenisKeuanganDebit',this.jenisKeuanganDebit);
    let dataKirim = {
      dariAplikasi: true,
      operator: this.userData.fc_kdkaryawan,
      nama_keuangan: this.jenisKeuangan.kode_nama_keuangan,
      no_nota: this.notaPilih.fc_nofaktur,
      //status_pakai: this.gunakanSaldo? 'Yes' : 'No',
      belum_bayarne : this.notaPilih.fm_selisih,
      keterangan_tagihan : this.ketReturn,
      kode_pelanggan: this.notaPilih.fc_kdcust? this.notaPilih.fc_kdcust : "",
      cash: this.bayarKeuangan,
      Total: this.notaPilih.fm_selisih,
      GrandTotal: this.notaPilih.fm_dpp,
      biayaTotal: this.notaPilih.fm_total,
      area : this.userData.fc_kdarea,
      divisi : this.userData.fc_kddivisi,
      simpan: true

      // id_pelanggan: this.notaPilih.id_pelanggan? this.notaPilih.id_pelanggan : "",


      // id_penjualanne: this.notaPilih.id_penjualan,
      // metode_pembayaran: this.jenisPembayaran,
      // BiayaKirim: this.biayaEkspedisi,
      // Potongan: this.potonganPembayaran,

    }

    this.server.pembayaranBayarPiutang(dataKirim).then(data => {
      this.bayarLoading = false;
      try{
        data = JSON.parse(data);
      }catch{
        console.log('error parse json - pembayaranBayar');
      }
      console.log(data);
      if(data.success){
        this.afterSimpan();

      }else{
        this.pesan.showToast('Pembayaran Gagal', 'bottom', 'danger');
        this.bayarLoading = false;
      }
    }).catch(err => {
      console.log(err);
      this.pesan.showToast('Pembayaran Gagal', 'bottom', 'danger');
      this.bayarLoading = false;
      this.ambilDataNota();
    })
  }

  afterSimpan(){
    this.showPembayaran = false;
    this.ambilDataNota();
    this.notaPilih = null;
  //  this.jenisPembayaran = 0;
    //this.biayaEkspedisi = 0;
    //this.potonganPembayaran = 0;
    this.jenisKeuangan = this.jenisKeuanganUI[this.jenisKeuanganUI.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
    this.bayarKeuangan = 0;

    this.modalShow = false;
  }

  modalBatal(){
    this.showPembayaran = false;
    // this.jenisPembayaran = 0;
    this.bayarKeuangan = 0;
    // this.bayarKeuanganDebit = 0;
    // this.bayarKeuanganTransfer = 0;
  }

  showNotaModal = false;
  lihatNota(){
    let l = this.pesan.showLoading('Memuat Nota ' + this.notaPilih.fc_nofaktur);
  //  console.log('nota',this.notaPilih.id_penjualan);
    this.server.notaGetNotaKecilNew(this.notaPilih.fn_idpenjualan).then(data => {
      l.dismiss();
      this.notaPrintHtml = this.sanitized.bypassSecurityTrustHtml(data);
      this.showNotaModal = true;
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
