import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-penjualan',
  templateUrl: 'penjualan.html'
})
export class PenjualanPage {

  userData;
  noNota;
  notaPilih;
  bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sept', 'Okt', 'Nov', 'Des']
  tanggal =  new Date().getDate() + " - " + this.bulan[new Date().getMonth()] + " - " + new Date().getFullYear();

  segKeranjang = 'infoNota';
  dataKaryawan = [];
  dataPelanggan = [];
  jenisKeuanganUI = [];
  jenisKeuanganDebitUI = [];
  operator;
  pelanggan;
  jenisPembayaran: any = 0;
  jenisKeuangan;
  tglFaktur;
  bayarKeuangan = 0;
  jenisKeuanganDebit;
  bayarKeuanganDebit = 0;
  totalHargaBelanja = 0;
  jumlahTop;

	dataBarang = [];
  dataBarangUi = [];
  dataPotonganPerBarang = [];
  dataPotonganPeriode = [];

  beliBarang = [];
  beliBarangUi = [];
  totalBelanja = 0;
  totalQty =  0;

  textCari;

  catatan = "";
  @ViewChild('seg') seg: any;

  hideTotal = false;

  simpanLoading = false;

  showModal = false;

  showModalPelanggan = false;
  dataPelangganUi = [];
  textCariPelanggan;
  pelangganUi = 0;

  showModalKaryawan = false;
  titleModalKaryawan = 'Karyawan'
  dataKaryawanUi = [];
  textCariKaryawan;
  karyawanUi;

  showModalTambahPelanggan = false;
  showModalBayar = false;
  modalKodePelanggan;
  modalKodeCust;
  modalAlamatCust = '';
  modalNamaCust;
  modalKtpCust = '';
  modalEmailCust = '';
  modalHoldCust = '';
  modalKotaCust = '';
  modalTelpCust = '';
  modalTopCust = '';
  modalProfesiCust = '';
  modalStsCust = '';
  segModalNoTlp = 'no1';
  dataTop;
  dataProfesi;
  modalTopPelanggan = {
    id_top: 3,
    jumlah: 0,
    nama_top: "TUNAI"
  }
  simpanPelangganLoading = false;

  showNotaModal = false;
  bayarLoading = false;
  notaPrintHtml;
  loadingPrint;

  saldo = 0;
  uang = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

  constructor(
    private platform: Platform,
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
    private printer: Printer
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
      this.ambilDataKaryawan();
    })

    this.ambilBarangDariServer();
    this.ambilDataPelanggan();
    this.ambilPotonganPerBarang();
    this.ambilKeuangan();
    this.ambilKeuanganDebit();
  }

  ionViewDidEnter(){
    if(this.pelanggan && this.pelanggan.fc_kdcust){
      this.ambilNoNotaPelanggan(this.pelanggan.fc_kdcust);
    }else{
      this.ambilNoNotaUmum();
    }
  }

  ambilDataKaryawan(){
    this.server.getDataKaryawan().then(data => {
      this.dataKaryawan = data;
      this.dataKaryawanUi = data;
      let index = data.findIndex(v => v.fc_kdkaryawan == this.userData.fc_kdkaryawan);

      this.karyawanUi = data[index];
     // this.ambilNoNotaUmum();
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Karyawan, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err);
    })
  }

  ambilDataPelanggan(){
    this.server.getDataPelanggan().then(data => {
      this.dataPelanggan = data;
      this.dataPelangganUi = data;
      console.log(this.dataPelangganUi);
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Pelanggan, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err);
    })
  }

  ambilBarangDariServer(){
    let l = this.pesan.showLoading('Memuat Data Barang');
    this.server.penjualanGetDataBarang().then(data => {
      l.dismiss();
      if(data.status == 1){
     //   console.log('barang',data.datanya.findIndex(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi));
        this.dataBarang = data.datanya;
        this.dataBarangUi = data.datanya.filter(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi);
      }
    }).catch(err => {
      l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.dataBarangUi.length == 1){
        //this.tambahBeli(0);
      }
      e.target.select();
    }
  }

  cariOnInput(e){
    this.dataBarangUi = this.dataBarang.filter(v => {
      return v.fc_barcode.toLowerCase().includes(this.textCari.toLowerCase()) || v.fv_namastock.toLowerCase().includes(this.textCari.toLowerCase());
    })
  }

  cariOnCancel(){}

  refresh(refresher){
    this.server.penjualanGetDataBarang().then(data => {
      refresher.complete();
      if(data.status == 1){
        console.log(data, 'ambilBarangDariServer')
        this.dataBarang = data.datanya;
        this.dataBarangUi = this.dataBarang;
      }
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast("Gagal Memuat Data Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
    // this.ambilPotonganPelanggan();
    this.ambilDataPelanggan();
    this.ambilDataKaryawan();
    this.ambilPotonganPerBarang();
  }

  tambahBeli(i){
    if(this.dataBarangUi[i].fn_qty < 1) return;
    this.segKeranjang = 'barang';

    let cekPotonganPerBarang = this.dataPotonganPerBarang.filter(v => {
      return v.fc_kdstock == this.dataBarangUi[i].fc_kdstock && v.ff_disc_rupiah > 0;
    })

    let barang = {
      fc_kdstock : this.dataBarangUi[i].fc_kdstock,
      fc_barcode : this.dataBarangUi[i].fc_barcode,
      fv_namastock : this.dataBarangUi[i].fv_namastock,
      fc_kdtipe : this.dataBarangUi[i].fc_kdtipe,
      fc_kdbrand : this.dataBarangUi[i].fc_kdbrand,
      fc_kdgroup : this.dataBarangUi[i].fc_kdgroup,
      jumlah: 1,
      fm_hargajual : this.dataBarangUi[i].fm_hargajual,
      fc_kdsatuan : this.dataBarangUi[i].fc_kdsatuan,
      ff_disc_persen : this.dataBarangUi[i].ff_disc_persen,
      ff_disc_rupiah : this.dataBarangUi[i].ff_disc_rupiah,
      fv_nmtipe : this.dataBarangUi[i].fv_nmtipe,
      fv_nmbrand : this.dataBarangUi[i].fv_nmbrand,
      fv_nmgroup : this.dataBarangUi[i].fv_nmgroup,
      fv_satuan : this.dataBarangUi[i].fv_satuan,
      stok : this.dataBarangUi[i].fn_qty
    }

    let kelompokBarang = {
      harga : cekPotonganPerBarang.length > 0? this.dataBarangUi[i].fm_hargajual - cekPotonganPerBarang[0].ff_disc_rupiah :
              this.dataBarangUi[i].fm_hargajual,
      harga_asli: this.dataBarangUi[i].fm_hargajual,
      sub_total : cekPotonganPerBarang.length > 0? this.dataBarangUi[i].fm_hargajual - cekPotonganPerBarang[0].ff_disc_rupiah :
                  this.dataBarangUi[i].fm_hargajual,
      potPer: cekPotonganPerBarang.length > 0? true : false,
      barang: [barang]
    }

    this.beliBarangUi.push(kelompokBarang);
    this.hitungTotal();
  }

  changeJumlah(ik, bbb){
    if(Number(bbb.jumlah) > Number(bbb.stok)){
      // pesan max pembelian seeuai stok
      bbb.jumlah = bbb.stok;
    }else if(Number(bbb.jumlah) == 0 ){
      bbb.jumlah = 1;
    }
    this.hitungSubTotal(ik, bbb);
  }

  tambahJumlah(ik, bbb){
    // cek stok first
    if(bbb.jumlah > bbb.stok) return;
    bbb.jumlah += 1;
    this.hitungSubTotal(ik, bbb);
  }

  kurangJumlah(ik, bbb){
    if(bbb.jumlah <= 1) return;
    bbb.jumlah -= 1;
    this.hitungSubTotal(ik, bbb);
  }
  hapusBarang(ik, i){
    if(this.beliBarangUi[ik].barang.length == 1){
      this.beliBarangUi.splice(ik, 1);
      this.hitungTotal();
    }else{
      this.beliBarangUi[ik].barang.splice(i, 1);
      this.hitungSubTotal(ik, this.beliBarangUi[ik].barang[0]);
    }
  }

  hitungSubTotal(ik, bbb){
    let jumlah = this.beliBarangUi[ik].barang
      .map(v => { return v.jumlah })
      .reduce((a, c) => { return Number(a) + Number(c) }, 0);


    let harga = this.beliBarangUi[ik].harga;

    this.beliBarangUi[ik].sub_total = jumlah * harga;
    this.beliBarangUi[ik].harga = harga;

    this.hitungTotal();
  }

  hitungTotal(){
    this.totalBelanja = this.beliBarangUi
    .map(v => { return v.sub_total })
    .reduce((a, c) => { return Number(a) + Number(c) }, 0);
  }


  aa: any;
  catFocus(scroll, e){
    this.hideTotal = true;
    clearTimeout(this.aa);
    if(scroll){
      setTimeout(() => {
        this.seg.nativeElement.scroll({
          top: this.seg.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 300)
    }else{
      setTimeout(() => {
        this.seg.nativeElement.scroll({
          top: this.seg.nativeElement.scrollTop + e._elementRef.nativeElement.getBoundingClientRect().top - 42 - 56 - 24,
          behavior: 'smooth'
        });
      }, 300)
    }
  }

  ambilPotonganPerBarang(){
    this.server.penjualanGetPotonganPerBarang().then(data => {
      this.dataPotonganPerBarang = data;
      // console.log(data, 'ambilPotonganPerBarang')
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Potongan Pembelian Per Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  catBlur(){
    this.aa = setTimeout(() => {
      this.hideTotal = false;
    }, 500)
  }

  ambilPotonganPeriode(){
    this.server.penjualanGetPotonganPeriode().then(data => {
      this.dataPotonganPeriode = data;
      console.log('data potongan pelanggan: ', data)
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Potongan Pelanggan, Periksa Koneksi Anda.", 'bottom', 'danger');
      console.log(err)
    })
  }

  ambilNoNotaUmum(){
    this.server.penjualanGetNoNotaUmum().then(data => {
      console.log(data, 'nota umum');
      let dNota = data.maxs? data.maxs.split('/')[1] : 0,
          d = (new Date().getDate() < 10? '0' : '') + new Date().getDate(),
          m = new Date().getMonth() + 1,
          y = new Date().getFullYear().toString().substr(-2),
          urut = d == dNota? data.maxs.split('/')[4] : "000";
      urut++;

      // console.log(urut, 'urut');
      this.noNota = this.operator.fc_kdkaryawan +'/'+d+'/'+m+'/'+y+'-'+'UM'+ this.operator.fc_kdkaryawan.slice(-2) +'/' + this.pad(urut, 3);
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Nota, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  pad(num, size) {
    var s = "00000" + num;
    return s.substr(s.length-size);
  }

  ambilNoNotaPelanggan(noPelanggan){
    let loading = this.pesan.showLoading('Memuat Nota');
    this.server.penjualanGetNoNotaPelanggan(noPelanggan).then(data => {
      loading.dismiss();
      console.log(new Date().getMonth(), 'nota pelanggan')
      let d = (new Date().getDate() < 10? '0' : '') + new Date().getDate(),
          m = new Date().getMonth() + 1,
          y = new Date().getFullYear().toString().substr(-2),
          urut;

      if(!data.maxs){
        data.maxs = this.operator.fc_kdkaryawan +'/'+d+'/'+m+'/'+y+'-'+noPelanggan+'/'+"00";
      }
      urut = d == data.maxs.split('/')[1]? data.maxs.split('/')[4] : "00";
      urut++;
      this.noNota = this.operator.fc_kdkaryawan +'/'+d+'/'+m+'/'+y+'-'+noPelanggan+'/' + this.pad(urut, 3);

    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Nota, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  openModalPelangan(){
    this.showModalPelanggan = true;
  }

  modalPelangganOk(){
    this.beliBarangUi = [];
    this.pesan.showToast("Data keranjang dikosongkan", 'top');
    this.catatan = "";
    // console.log(this.pelangganUi, 'change data pelanggan')
    this.pelanggan = this.pelangganUi;
    if(this.pelanggan && this.pelanggan.fc_kdcust){
      this.ambilNoNotaPelanggan(this.pelanggan.fc_kdcust);
    }

    this.showModalPelanggan = false;
  }

  cariPelanggan(){
    this.dataPelangganUi = this.dataPelanggan.filter(v => {
      return v.fv_nama.toLowerCase().includes(this.textCariPelanggan.toLowerCase()) || v.fc_kdcust.toLowerCase().includes(this.textCariPelanggan.toLowerCase()) || v.fv_alamat.toLowerCase().includes(this.textCariPelanggan.toLowerCase());
    })
  }

  modalBatal(){
    this.showModalPelanggan = false;
    this.pelangganUi = 0;
    this.showModalKaryawan = false;
    this.karyawanUi = 0;
    this.titleModalKaryawan = 'Karyawan';
    this.showNotaModal = false;
    this.notaPrintHtml = null;
  }

  modalBatalBayar(){
    this.showModalBayar = false;
    this.jenisPembayaran = 0;
    this.bayarKeuangan = 0;
    this.bayarKeuanganDebit = 0;
   // this.bayarKeuanganTransfer = 0;
  }

  modalTambahPelanggan(){
    this.showModalPelanggan = false;
    let i = this.pesan.showLoading('Memuat Kode Pelanggan..');

    this.server.penjualanGetKodePelanggan().then(data => {
      this.showModalTambahPelanggan = true;
      i.dismiss();
      if(data.kode){
        this.modalKodePelanggan = data.kode;
        this.dataProfesi = data.profesi;
        this.dataTop = data.top;
      }else{
        this.pesan.showToast('Gagal Memuat Kode Pelanggan, Coba Lagi..')
      }
    }).catch(err => {
      this.pesan.showToast('Gagal Memuat Kode Pelanggan, Coba Lagi..')
      i.dismiss();
      this.showModalTambahPelanggan = true;
    })
  }

  tambahPelanggan(){
    if(!this.modalNamaCust) return this.pesan.showAlert("", "Masukkan Nama Pelanggan");
    this.simpanPelangganLoading = true
    let dataKirim = {
      dariAplikasi: true,
      fc_kdcust: this.modalKodePelanggan,
      fv_nama: this.modalNamaCust,
      fv_alamat: this.modalAlamatCust,
      fv_email: this.modalEmailCust,
      fc_notelp: this.modalTelpCust,
      fv_noktp: this.modalKtpCust,
      fc_kota: this.modalKotaCust,
      fc_kdprofesi: this.modalProfesiCust,
      fc_statusangsur: this.modalStsCust,
      fc_kdtop: this.modalTopCust,
      fc_hold: this.modalHoldCust,
      add: true
    }

    this.server.penjualanTambahPelanggan(dataKirim).then(data => {
      console.log(data);
      data = JSON.parse(data);
      this.simpanPelangganLoading = false;
      if(data.success){
        this.ambilDataPelanggan();
        this.pesan.showAlert("", "Berhasil Menambahkan Pelanggan").then(data => {
          this.showModalPelanggan = true;
          this.showModalTambahPelanggan = false;
        })
        this.modalKodePelanggan = null;
        this.modalNamaCust = null;
        this.modalAlamatCust =  '';
        this.modalEmailCust = '';
        this.modalTelpCust = '';
        this.modalKtpCust = '';
        this.modalKotaCust = '';
        this.modalProfesiCust = '';
        this.modalStsCust = '';
        this.modalTopCust = '';
        this.modalHoldCust = '';
      }else{
        this.pesan.showAlert("", "Gagal Menambahkan Pelanggan");
      }
    }).catch(err => {
      this.simpanPelangganLoading = false;
      this.pesan.showAlert("", "Gagal Menambahkan Pelanggan");
      console.log(err);
    })
  }

  bayar(){
    this.showModalBayar = true;
  }

  ambilKeuangan(){
    this.server.pembayaranGetDataKeuangan().then(data => {
      this.jenisKeuanganUI = data;
      this.jenisKeuangan = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
      console.log(data, data.findIndex(x => x.nama_keuangan.toLowerCase() === "kasir"))
    }).catch(err => {
      console.log(err)
    })
  }

  ambilKeuanganDebit(){
    this.server.pembayaranGetDataKeuanganDebit().then(data => {
      this.jenisKeuanganDebitUI = data;
      this.jenisKeuanganDebit = data[data.findIndex(x => x.nama_keuangan.toLowerCase() === "bca rek lama")]
      console.log(data)
    }).catch(err => {
      console.log(err)
    })
  }

  jenisPembayaranChange(){
    if(this.saldo){
      this.bayarKeuangan = 0;
      this.bayarKeuanganDebit = 0;
      return;
    }
    // this.bayarKeuangan = this.jenisPembayaran == 'cash' || this.jenisPembayaran == 'cash_debit'? (this.notaPilih.selisih * -1) : 0;
    // this.bayarKeuanganDebit = this.jenisPembayaran == 'debit' || this.jenisPembayaran == 'debit_transfer'? (this.notaPilih.selisih * -1) : 0;
  }

  pembayaran(){
    this.bayarLoading = true;

    let dataSimpan = {
      dariAplikasi : true,
      fc_nofaktur : this.noNota,
      fc_kdkaryawan : this.operator.fc_kdkaryawan,
      fd_tglinput : new Date().toJSON().slice(0,10).replace(/-/g,'-'),
      fc_kdcust : this.pelanggan && this.pelanggan != 0 ? this.pelanggan.fc_kdcust : 0,
      fc_contacperson : this.pelanggan && this.pelanggan != 0 ? this.pelanggan.fc_notelp : 0,
      fv_alamatkirim : this.pelanggan && this.pelanggan != 0 ? this.pelanggan.fv_alamat : "",
      catatan : this.catatan,
      fn_qty : [],
      ff_disc_rupiah : [],
      fc_barcode : [],
      fc_kdstock : [],
      fc_kdtipe : [],
      fc_kdbrand : [],
      fc_kdgroup : [],
      fc_kdsatuan : [],
      fm_price : [],
      fm_disc : [],
      fm_subtot : [],
      fm_total : this.totalBelanja,
      fc_kdarea : this.operator.fc_kdarea,
      fc_kddivisi : this.operator.fc_kddivisi,
      metode_pembayaran : this.jenisPembayaran,
      nama_keuangan : this.jenisKeuangan.kode_nama_keuangan,
      cash : this.bayarKeuangan,
      nama_keuangan2 : this.jenisKeuanganDebit.kode_nama_keuangan,
      cash_debit : this.bayarKeuanganDebit,
      selisih_cash : this.bayarKeuangan - this.totalBelanja,
      selisih_debit : this.bayarKeuanganDebit - this.totalBelanja,
      simpan : true
    }

    this.beliBarangUi.forEach((v, i) => {
      v.barang.forEach((vv, i) => {
        dataSimpan['fn_qty'].push(vv.jumlah);
        dataSimpan['fc_kdstock'].push(vv.fc_kdstock);
        dataSimpan['fc_barcode'].push(vv.fc_barcode);
        dataSimpan['fc_kdtipe'].push(vv.fc_kdtipe);
        dataSimpan['fc_kdbrand'].push(vv.fc_kdbrand);
        dataSimpan['fc_kdgroup'].push(vv.fc_kdgroup);
        dataSimpan['fc_kdsatuan'].push(vv.fc_kdsatuan);
        dataSimpan['fm_price'].push(v.harga);
        dataSimpan['ff_disc_rupiah'].push(v.ff_disc_rupiah);
      })

      dataSimpan['fm_price'].push(v.harga);
      dataSimpan['fm_subtot'].push(v.sub_total);
    })

    console.log('dataSimpan',dataSimpan);

    this.server.penjualanSimpan(dataSimpan).then(data => {
      data = data.replace(data.substr(0, data.search('{"success"')), '')
      data = JSON.parse(data);
      console.log(data);
      this.bayarLoading = false;
      if(data.success){
        this.showNotaModal = true;
        this.notaPrintHtml = this.sanitized.bypassSecurityTrustHtml(data['nota']);
        this.showModalBayar = false;
        this.beliBarangUi = [];
        this.pelanggan = 0;
       // this.ambilNoNotaUmum();
        this.segKeranjang = 'infoNota';
        this.pelangganUi = 0;

        // this.pesan.showAlert("Berhasil","Berhasil Menambahkan Nota.").then(data => {
        // });
      }else{
        this.pesan.showToast("Gagal Menambahkan Nota", 'bottom', 'danger')
      }
    }).catch(err => {
      console.log(err);
      this.simpanLoading = false;
      this.pesan.showToast("Gagal Menambahkan Nota", 'bottom', 'danger')
    })
  }

  ambilNotaKecil(){
    this.server.notaGetNotaKecil(this.noNota).then(data => {
      this.notaPrintHtml = data;
      this.printNota('A6');
      // console.log(data, 'notaGetNotaKecil - ambilNotaKecil - PembayaranPage')
    }).catch(err => {
      this.showNotaModal = false;
      console.log(err, 'err notaGetNotaKecil - ambilNotaKecil');
    })
  }

  printNota(ukuran){
    if(this.platform.is('cordova')){
      this.printer.print(this.notaPrintHtml).then(data => {
        console.log(data, 'print');
        this.showNotaModal = false;
      }).catch(err => {
       // console.log(err, 'err print');
       this.showNotaModal = false;
      })
    }else{
      this.showNotaModal = false;
      this.pesan.showToast("device tidak mendukung print")
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
