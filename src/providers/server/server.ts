import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpRequest } from '@angular/common/http';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs";

import { StorageProvider } from '../storage/storage';

@Injectable()
export class ServerProvider {

 // public serverUrl;
  public serverUrl = 'http://127.0.0.1/viyon_backend/index.php/';
  // public serverUrl = 'http://192.168.100.22:8100/api/';
  //public serverUrl = 'http://rsigondanglegi.com/laris/';

  constructor(
    private platform: Platform,
    private HTTP: HTTP,
    private http: HttpClient,
    private storage: StorageProvider,
    private transfer: FileTransfer,
    private file: File
    ) {
    // this.serverUrl = platform.is('mobileweb') || platform.is('core')? 'http://localhost:8100/api/' : 'http://robertlawoffice.com/backend';
    this.storage.getStorage("server:url").then(data => {
      console.log(data, 'server:url');
      console.log(this.serverUrl)
      if(data) {
        this.serverUrl = data;
      }
      // else{
      //   this.setServerUrl(this.serverUrl);
      // }
    }).catch(err => {
      console.log(err, 'err server:url');
    })
  }

  // request handler
  public getRequest(url, text = false){
    let opt: any = {
      headers: new HttpHeaders({'Content-Type': 'application/json',  accept: 'text/plain'}),
      responseType: 'text'
    };
    if(!text) opt = {}
      // if(this.platform.is('cordova')){
      //    console.log('get cordova')
      //    return this.HTTP.get(url, {}, opt)
      //    .then(res => {
      //      console.log("get", res);
      //      return JSON.parse(res.data)
      //    })
      //  }else{
      //  console.log(opt)
      return this.http.get(url, opt)
      .toPromise().then((data: any) => {return data; });
    // }
  }

  public getRequest2(url, text = false){
    let opt: any = {
      headers: new HttpHeaders({'Content-Type': 'application/json','Access-Control-Allow-Origin': '*',  accept: 'text/plain'}),
      responseType: 'text'
    };
    if(!text) opt = {}
      // if(this.platform.is('cordova')){
      //    console.log('get cordova')
      //    return this.HTTP.get(url, {}, opt)
      //    .then(res => {
      //      console.log("get", res);
      //      return JSON.parse(res.data)
      //    })
      //  }else{
      //  console.log(opt)
      return this.http.get(url, opt)
      .toPromise().then((data: any) => {return data; });
    // }
  }

  public postRequest(url, data, useNative = true){
    var headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let formData = new FormData();
    for ( var key in data ) {
      formData.append(key, data[key]);
    }

    if(this.platform.is('cordova') && useNative){
      this.HTTP.setDataSerializer('urlencoded');
      return this.HTTP.post(url, data, {'Content-Type': 'application/x-www-form-urlencoded'})
      .then(res => {
        console.log(data)
        return res.data
      })
    }else{
      return this.http.post(
        url,
        this.serialize(data, null),
        { headers: headers, responseType: "text" })
      .toPromise().then((data : any) => { return data; });
    }
  }

  formData(myFormData){
    return Object.keys(myFormData).map(function(key){
      return encodeURIComponent(key) + '=' + encodeURIComponent(myFormData[key]);
    }).join('&');
  }

  serialize(obj, prefix) {
    var str = [],
    p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
        str.push((v !== null && typeof v === "object") ?
          this.serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }

  public login(username, password, area, divisi){
    let url = this.serverUrl + "Auth/login_android";
    return this.postRequest(url, { "username" :username, "password" : password, "area" : area, "divisi" : divisi });
  }

  public getDataKaryawan(){
    let url = this.serverUrl + "Penjualan/getKaryawan";
    return this.getRequest(url);
  }

  public getDivisi(){
    let url = this.serverUrl + 'Auth/getDivisi';
    return this.getRequest(url);
  }

  public getArea(){
    let url = this.serverUrl + 'Auth/getArea';
    return this.getRequest(url);
  }

  public getDataPelanggan(){
    let url = this.serverUrl + "Penjualan/getPelanggan";
    return this.getRequest(url);
  }

  public penjualanGetDataBarang(){
  	let url = this.serverUrl + "Penjualan/getDataBarang";
  	return this.getRequest(url);
  }

  public penjualanGetPotonganPeriode(){
    let url = this.serverUrl + "Penjualan/getDiskonPeriode";
    return this.getRequest(url);
  }

  // public penjualanGetPotonganMinPembelian(){
  //   let url = this.serverUrl + "Po_penjualan/getAllMinBarang";
  //   return this.getRequest(url);
  // }

  // public penjualanGetPotonganMinPembelianCampuran(){
  //   let url = this.serverUrl + "Po_penjualan/getAllCampuranBarang";
  //   return this.getRequest(url);
  // }

  public penjualanGetPotonganPerBarang(){
    let url = this.serverUrl + "Penjualan/getDiskone";
    return this.getRequest(url);
  }

  public penjualanGetNoNotaUmum(){
    let url = this.serverUrl + "Penjualan/max_umum";
    return this.getRequest(url);
  }

  public penjualanGetNoNotaPelanggan(noPelanggan){
    let url = this.serverUrl + "Penjualan/max_pel/" + noPelanggan;
    return this.getRequest(url);
  }

  public penjualanSimpan(data){
    let url = this.serverUrl + "Penjualan/simpanTransaksi";
    return this.postRequest(url, data, false);
  }

  public penjualanGetKodePelanggan(){
    let url = this.serverUrl + "Penjualan/ambilKodePelanggan";
    return this.getRequest(url);
  }

  public penjualanTambahPelanggan(data){
    let url = this.serverUrl + "Penjualan/add_data_pelanggan";
    return this.postRequest(url, data);
  }

  public barangGetDataBarang(){
    let url = this.serverUrl + 'Barang/getDataBarang';
    return this.getRequest(url);
  }

  public barangGetDetailBarang(id){
    let url = this.serverUrl + 'Barang/getDetailBarang/' + id;
    return this.getRequest(url);
  }

  // public barangGetDetailVarian(id){
  //   let url = this.serverUrl + 'Barang/rekom_qty_pelangan/' + id;
  //   return this.getRequest(url);
  // }

  // public pembayaranGetDataNota(){
  //   let url = this.serverUrl + 'Penjualan/get_penjualan_crud'
  //   return this.getRequest(url);
  // }

  public pembayaranGetDataNotaPiutang(){
    let url = this.serverUrl + 'Piutang_penjualan/get_penjualan_crud'
    return this.getRequest(url);
  }

  public pembayaranGetDataKeuangan(){
    let url = this.serverUrl + 'Penjualan/keuangane';
    return this.getRequest(url);
  }

  // public pembayaranGetDataKeuanganAll(){
  //   let url = this.serverUrl + 'Penjualan/get_keuangane';
  //   return this.getRequest(url);
  // }

  public pembayaranGetDataKeuanganDebit(){
    let url = this.serverUrl + 'Penjualan/keuangane2';
    return this.getRequest(url);
  }


  // (Please chek TOP feature)
  // ------------------- teko kene
  // public pembayaranGetDataTop(id_pelanggan){
  //   let url = this.serverUrl + 'Penjualan/cek_top/' + id_pelanggan;
  //   return this.getRequest(url);
  // }

  // public pembayaranGetSaldoPelanggan(id_pelanggan){
  //   let url = this.serverUrl + 'Penjualan/total_saldo_pelanggan/' + id_pelanggan;
  //   return this.getRequest(url);
  // }

  public pembayaranGetSaldoPenjualan(id_pelanggan){
    let url = this.serverUrl + 'Piutang_penjualan/total_saldo_pelanggan/' + id_pelanggan;
    return this.getRequest(url);
  }

  // public pembayaranBayar(data){
  //   let url = this.serverUrl + 'Penjualan/pos';
  //   return this.postRequest(url, data);
  // }

  public pembayaranBayarPiutang(data){
    let url = this.serverUrl + 'Piutang_penjualan/bayar_piutang_penjualan';
    return this.postRequest(url, data);
  }

  // public bpbGetDataBpb(){
  //   let url = this.serverUrl + 'Bpb_master/get_bpb_list';
  //   return this.getRequest(url);
  // }

  // public bpbGetSupplier(){
  //   let url = this.serverUrl + 'Bpb_master/get_supplier';
  //   return this.getRequest(url);
  // }

  // public bpbUpdateData(data){
  //   let url = this.serverUrl + 'Bpb_master/ajax_update';
  //   return this.postRequest(url, data);
  // }

  // public bpbAddData(data){
  //   let url = this.serverUrl + 'Bpb_master/ajax_add';
  //   return this.postRequest(url, data);
  // }

  public returnGetDataCari(t, kode){
    let url = this.serverUrl + "Return_penjualan/get_pembayaran_hutang_tampiloke" + kode + "/" + t + "/faktur";
    return this.getRequest(url);
  }

  public returnGetDataDetail(id){
    let url = this.serverUrl + "Return_penjualan/get_pembayaran_hutang_tampiloke2/" + id;
    return this.getRequest(url);
  }

  // public returnGetDataDetailPiutang(id){
  //   let url = this.serverUrl + "Piutang_penjualan/get_pembayaran_piutang_tampiloke2/" + id;
  //   return this.getRequest(url);
  // }

  // public returnGetDataCariPiutang(t, kode){
  //   let url = this.serverUrl + "Piutang_penjualan/get_pembayaran_piutang_tampiloke" + kode + "/" + t + "/faktur";
  //   return this.getRequest(url);
  // }

  public returnAmbilKeuangan(){
    let url = this.serverUrl + "Return_penjualan/ambilKeuangan";
    return this.getRequest(url);
  }

  // public getNoVoucher(){
  //   let url = this.serverUrl + "Kas_bon/ambilKodeVoucher";
  //   return this.getRequest(url);
  // }

  // public AmbilKaryawan(){
  //   let url = this.serverUrl + "Pegawai/ambilKaryawan";
  //   return this.getRequest(url);
  // }

  // public GetDataKasbon(){
  //   let url = this.serverUrl + "Kas_bon/ambilDataKasbon";
  //   return this.getRequest(url);
  // }

  public returnSimpan(data){
    let url = this.serverUrl + "Return_penjualan/simpan_return_penjualan";
    return this.postRequest(url, data, false);
  }

  // public pembayaranKasbonKaryawan(data){
  //   let url = this.serverUrl + "Kas_bon/simpanKasbonApi";
  //   return this.postRequest(url, data, false);
  // }

  public notaGetNotaKecil(id){
    let url = this.serverUrl + "Penjualan/nota_kecil/" + id;
    return this.getRequest(url, true);
  }

  public notaGetNotaKecilNew(id){
    let url = this.serverUrl + "Penjualan/nota_kecil_new/" + id;
    return this.getRequest(url, true);
  }

  // public notaGetNotaBesar(id){
  //   let url = this.serverUrl + "Penjualan/nota_besar2/" + id;
  //   return this.getRequest(url, true);
  // }

  public transaksiGetData(){
    let url = this.serverUrl + "Transaksi/keuangan_transaksi_awal";
    return this.getRequest(url);
  }

  public transaksiGetJenis(){
    let url = this.serverUrl + "Transaksi/ambil_jenis";
    return this.getRequest(url);
  }

  public transaksiGetKeuangan(){
    let url = this.serverUrl + "Transaksi/ambil_keuangan";
    return this.getRequest(url);
  }
  public transkasiAddData(data){
    let url = this.serverUrl + 'Transaksi/simpan_transaksi_keuangan';
    return this.postRequest(url, data);
  }

  public transkasiUpdateData(data){
    let url = this.serverUrl + 'Transaksi/simpan_transaksi_keuangan_ubah';
    return this.postRequest(url, data);
  }

  // public tutupHarian(){
  //   let url = this.serverUrl + 'Transaksi/simpan_proses_tutup_harian_android';
  //   return this.getRequest(url);
  // }

  public uploadFile(url: string, data){
    let formData = new FormData();
    for ( var key in data ) {
      if(key == 'file-upload' && data[key]){
        formData.append(key, data[key], data[key].name);
      }else{
        formData.append(key, data[key]);
      }
    }
    return this.http.post(this.serverUrl + url, formData, { responseType: "text" })
    .toPromise().then((data: any) => {return data});
  }

  public nativeUploadFile(file, url, data, fileKey = 'file-upload'){
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: fileKey,
      fileName: data.kode_bpb + ".jpg",
      chunkedMode: false,
      mimeType: "image/jpg",
      params : data,
      headers: {}
    }

    return fileTransfer.upload(file, this.serverUrl + url, options)
    .then(res => { return JSON.parse(res.response) })
  }

  public setServerUrl(url){
    url = url.includes('://')? url.split('://')[1] : url;
    this.serverUrl = 'http://' + url + '/';
    this.storage.setStorage('server:url', this.serverUrl);
  }
}
