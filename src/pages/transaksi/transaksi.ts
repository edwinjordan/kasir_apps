import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  selector: 'page-transaksi',
  templateUrl: 'transaksi.html'
})
export class TransaksiPage {

  userData;
  textCari;
  transaksi = [];
  transaksiUi = [];
  dataUraian = [];
  uraianUi = [];
  keuanganUi = [];


  serverUrl = this.server.serverUrl;
  serverUrlImg = this.serverUrl + 'assets/images/';

  openModalAdd = false;
  openModalUpdate = false;

  transaksiPilih = {
    no_faktur: null,
    kode_nama_keuangan: null,
    kode_transaksi_master: null,
    kredit_transaksi_master: null,
    debit_transaksi_master: null,
    keterangan_transaksi_master: null,
    lampiran: null
  };

  jenisTransaksi: any = 0;
  namaUraian: any = 0;
  jenisKeuangan: any = 0;
  total = 0;
  keterangan;
  selectedFiles: File;
  selectedFilesUi;
  selectedFilesNative
  selectedFilesNativeUi

  simpanLoading = false;

  constructor(
    public navCtrl: NavController,
    private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private camera: Camera,
    private transfer: FileTransfer,
    private alertCtrl: AlertController,
    private file: File,
    private filePath: FilePath
  ) {
  }

  ionViewDidLoad() {
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      console.log("userdata", this.userData)
    })
    this.pesan.showToast("Tarik kebawah untuk memuat ulang data transaksi", 'top', 'normal', 4000)
    this.getDataTransaksi();
    this.getUraian();
    this.getKeuangan();
  }

  getDataTransaksi() {
    let l = this.pesan.showLoading('Memuat Data Bpb');
    this.server.transaksiGetData().then(data => {
      l.dismiss();
      this.transaksi = data;
      this.transaksiUi = data.filter(v => v.fc_kdarea == this.userData.fc_kdarea && v.fc_kddivisi == this.userData.fc_kddivisi);
    }).catch(err => {
      l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Transaksi")
      console.log(err)
    })
  }

  getUraian() {
    // let l = this.pesan.showLoading('Memuat Data Uraian');
    this.server.transaksiGetJenis().then(data => {
      // l.dismiss();
      this.dataUraian = data;
      this.uraianUi = data;
      console.log(data, 'uraian')
    }).catch(err => {
      // l.dismiss();
      this.pesan.showToast("Gagal Memuat Data  Uraian")
      console.log(err)
    })
  }

  getKeuangan() {
    // let l = this.pesan.showLoading('Memuat Data Keuangan');
    this.server.transaksiGetKeuangan().then(data => {
      // l.dismiss();
      this.keuanganUi = data;
      this.jenisKeuangan = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
      console.log(this.keuanganUi, this.jenisKeuangan, 'keuangan - getKeuangan - keuanganPage')
    }).catch(err => {
      // l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Keuangan")
      console.log(err)
    })
  }

  refresh(refresher){
    this.server.transaksiGetData().then(data => {
      refresher.complete()
      this.transaksi = data;
      this.transaksiUi = data;
    }).catch(err => {
      refresher.complete()
      this.pesan.showToast("Gagal Memuat Data Transaksi")
      console.log(err)
    });
    this.getUraian();
    this.jenisKeuangan = null;
    this.getKeuangan();
  }

  tambahTransaksi() {
    this.openModalAdd = true;
     this.selectedFiles = null;
    this.selectedFilesUi = null;
    this.selectedFilesNative = null;
    this.selectedFilesNativeUi = null;
  }

  editTransaksi(b) {
    this.openModalUpdate = true;
    this.transaksiPilih = b;
    this.total = !b.debit_transaksi_master || b.debit_transaksi_master == 0? b.kredit_transaksi_master : b.debit_transaksi_master;
    this.keterangan = this.transaksiPilih.keterangan_transaksi_master;
    this.selectedFiles = null;
    this.selectedFilesUi = null;
    this.selectedFilesNative = null;
    this.selectedFilesNativeUi = null;
    console.log(this.transaksiPilih);
  }

  ubahJenisTransaksi(){
    this.uraianUi = this.dataUraian.filter(v => v.status_debit_kredit == (this.jenisTransaksi == 'pemasukan'? 2 : 1))
  }

  hideModelUpdate() {
    this.openModalUpdate = false;
    this.transaksiPilih = {
      no_faktur: null,
      kode_nama_keuangan: null,
      kode_transaksi_master: null,
      kredit_transaksi_master: null,
      debit_transaksi_master: null,
      keterangan_transaksi_master: null,
      lampiran: null,

    };
    this.selectedFiles = null;
    this.selectedFilesUi = null;
    this.selectedFilesNative = null;
    this.selectedFilesNativeUi = null;
    this.total = 0;
    this.keterangan = '';
  }

  hideModelAdd() {
    this.openModalAdd = false;
    this.jenisTransaksi = 0;
    this.namaUraian = 0;
    this.jenisKeuangan = this.keuanganUi[this.keuanganUi.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
    this.total = 0;
    this.keterangan = "";
    this.selectedFiles = null;
    this.selectedFilesUi = null;
    this.selectedFilesNative = null;
    this.selectedFilesNativeUi = null;
  }

  ambilPhoto() {
    let alert = this.alertCtrl.create({
      title: "Ambil Photo",
      cssClass: 'ambil-photo',
      buttons: [
        {
          text: 'Ambil Photo Dari Kamera',
          handler: () => {
            this.pilihGambar(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Pilih Photo Dari Galeri',
          handler: () => {
            this.pilihGambar(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }
      ]
    });
    alert.present();
  }

  pilihGambar(sourceType) {
    let cameraOptions = {
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,
      // destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      quality: 30,
      mediaType: this.camera.MediaType.PICTURE,
      // correctOrientation: true,
      // allowEdit: true,
    }

    this.camera.getPicture(cameraOptions).then(img => {
      // this.selectedFiles = 'data:image/jpeg;base64,' + imageData;
      this.selectedFilesNative = img;
      // this.selectedFilesNativeUi = img;
      this.filePath.resolveNativePath(img).then(filePath => {
        this.selectedFilesNativeUi = filePath;
      }).catch(err => console.log(err));
    }, err => {
      console.log("camera error " + err);
      this.pesan.showToast("Gagal Memuat Gambar");
    })
  }

  selectFile(event) {
    var files = event.target.files;
    var file = files[0];
    this.selectedFiles = file;

    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }

    // this.selectedFilesUi = event.target.files;
    // this.bpbPilih['image'] = new FileReader().readAsDataURL(this.selectedFiles.item(0));
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.selectedFilesUi = "data:image/jpeg;base64," + btoa(binaryString);
  }

  tambah() {
    if (this.jenisTransaksi == 0 || this.namaUraian == 0 || this.jenisKeuangan == 0) {
      return this.pesan.showToast("Mohon isikan semua data.");
    }
    this.simpanLoading = true;
    let dataKirim = {
      dariAplikasi: true,
      id_karyawan: this.userData.id_karyawan,
      pemasukan_transaksi: this.jenisTransaksi,
      nama_akun: this.namaUraian.id_transaksi_akun,
      nama_keuangan: this.jenisKeuangan.kode_nama_keuangan,
      total: this.total,
      keterangan_transaksi: this.keterangan,
      'file-upload': this.selectedFiles,
      fc_kdarea : this.userData.fc_kdarea,
      fc_kddivisi : this.userData.fc_kddivisi,
    }

    if(this.selectedFilesNative){
      this.server.nativeUploadFile(this.selectedFilesNative, 'Transaksi/simpan_transaksi_keuangan', dataKirim).then(data => {
        console.log(data, 'hasil upload - TransaksiPage');
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.getDataTransaksi();
            this.hideModelAdd();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Menambahkan Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataTransaksi();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      })
    }else{
      this.server.transkasiAddData(dataKirim).then(data => {
        console.log(data, 'hasil update tanpa upload - PembelianPage');
        data = JSON.parse(data);
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelAdd();
            this.getDataTransaksi();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Edit Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataTransaksi();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      })
    }

    // this.server.uploadFile("Transaksi/simpan_transaksi_keuangan", dataKirim).then(data => {
    //   console.log(data);
    //   data = JSON.parse(data);
    //   this.simpanLoading = true;

    //   if (data.success) {
    //     this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Transaksi').then(data => {
    //       this.simpanLoading = false;
    //       this.getDataTransaksi();
    //       this.hideModelAdd();
    //     })
    //   } else {
    //     this.pesan.showToast("Gagal Menambahkan Transaksi")
    //   }
    // }).catch(err => {
    //   this.simpanLoading = false;
    //   this.getDataTransaksi();
    //   console.log(err);
    //   this.pesan.showToast("Gagal Menambahkan Transaksi")
    // })
  }

  simpan() {
    this.simpanLoading = true;
    let dataKirim = {
      dariAplikasi: true,
      id_karyawan: this.userData.id_karyawan,
      // pemasukan_transaksi: this.transaksiPilih.pemasukan_transaksi,
      nama_akun: this.namaUraian.id_transaksi_akun,
      nama_keuangan: this.jenisKeuangan.kode_nama_keuangan,
      total: this.total,
      debit_transaksi_master: this.transaksiPilih.debit_transaksi_master,
      keterangan_transaksi: this.keterangan,
      'file-upload2': this.selectedFiles,
      id_nama_keuangan: this.transaksiPilih.no_faktur,
      jenis_keuangan: this.transaksiPilih.kode_nama_keuangan,
      // total: !this.transaksiPilih.debit_transaksi_master || this.transaksiPilih.debit_transaksi_master == 0? this.transaksiPilih.kredit_transaksi_master : this.transaksiPilih.debit_transaksi_master,
      kode_transaksi_master: this.transaksiPilih.kode_transaksi_master,
      fc_kdarea : this.userData.fc_kdarea,
      fc_kddivisi : this.userData.fc_kddivisi,
     // keterangan_transaksi: this.transaksiPilih.keterangan_transaksi_master,
      // 'file-upload2': this.selectedFiles
    }

    if(this.selectedFilesNative){
      this.server.nativeUploadFile(this.selectedFilesNative, 'Transaksi/simpan_transaksi_keuangan_ubah', dataKirim, "file-upload2").then(data => {
        console.log(data, 'hasil upload - TransaksiPage');
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.getDataTransaksi();
            this.hideModelUpdate();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Menambahkan Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataTransaksi();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      })
    }else{
      this.server.transkasiUpdateData(dataKirim).then(data => {
        console.log(data, 'hasil update tanpa upload - PembelianPage');
        data = JSON.parse(data);
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelUpdate();
            this.getDataTransaksi();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Edit Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataTransaksi();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      })
    }

    // this.server.uploadFile("Transaksi/simpan_transaksi_keuangan_ubah", dataKirim).then(data => {
    //   console.log(data);
    //   data = JSON.parse(data);
    //   this.simpanLoading = true;

    //   if (data.success) {
    //     this.pesan.showAlert('Berhasil', 'Berhasil Edit Transaksi').then(data => {
    //       this.simpanLoading = false;
    //       this.getDataTransaksi();
    //       this.hideModelUpdate();
    //     })
    //   } else {
    //     this.pesan.showToast("Gagal Edit Transaksi")
    //   }
    // }).catch(err => {
    //   this.simpanLoading = false;
    //   this.getDataTransaksi();
    //   console.log(err);
    //   this.pesan.showToast("Gagal Edit Transaksi")
    // })
  }

  inputPress(e) {
    if ((e.key == "Enter" || e.keyCode == 13) && this.textCari) {
      if (this.transaksiUi.length == 1) {
        // this.bpbPilih = this.bpbUi[0]
      }
      e.target.select();
    }
  }
  cariOnInput(e) {
    this.transaksiUi = this.transaksi.filter(v => {
      return v.nama_transaksi_akun.toLowerCase().includes(this.textCari.toLowerCase()) ||
        v.keterangan_transaksi_master.toLowerCase().includes(this.textCari.toLowerCase())
    })
    console.log(this.transaksiUi)
  }
  cariOnCancel() { }

  setting(){
    this.pesan.changeServerUrl().then(data => {
      console.log(data, 'changeServerUrl - setting - LoginPage');
      this.server.setServerUrl(data);
    }).catch(err => {
      console.log(err, 'err changeServerUrl - setting - LoginPage')
    })
  }

}
