import { Component } from '@angular/core';
import { NavController, Nav, Platform  } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';
import { TabsPage } from '../tabs/tabs';

import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  dataArea = [];
  dataDivisi = [];
  DivisiUI = [];
  AreaUI = [];
  getDivisi;
  username = '';
  password = '';
  area = '';
  divisi ='';

  masukLoading = false;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private nav: Nav,
    private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer) {
  }

  ionViewDidLoad(){

    this.ambilDivisi();
    this.ambilArea();
  }

  ambilDivisi(){
    this.server.getDivisi().then(data => {
      this.DivisiUI = data;
    }).catch(err => {
      console.log(err)
    })
  }

  ambilArea(){
    this.server.getArea().then(data => {
      this.AreaUI = data;
    }).catch(err => {
      console.log(err)
    })
  }

  login(){
    this.masukLoading = true;
    // console.log(this.username, this.password)
    this.server.login(this.username, this.password, this.area, this.divisi).then(data => {
      data = JSON.parse(data);
      console.log("login after parse", data);
      if(data.success == 'success'){
        this.masukLoading = false;
        data.data['submenu'] = data.submenu;
        data.data['posisi'] = data.posisi;
        data.data['divisi'] = data.divisi;
        data.data['area'] = data.area;
        if(data.submenu.lenght < 1) return this.pesan.showAlert('Gagal Masuk', 'Anda tidak memiliki akses.')
        this.storage.setStorage("user:data", data.data).then(data => {
          this.nav.setRoot(TabsPage);
        })
      }else{
        this.masukLoading = false;
        this.pesan.showToast("Terjadi kesalahan, Hubungi pengembang aplikasi.", 'bottom', 'danger')
      }
    }).catch(err => {
      console.log(err);
      this.masukLoading = false;
      // this.pesan.showToast(JSON.stringify(err), 'bottom', 'danger', 8000);
      this.pesan.showAlert("error login", JSON.stringify(err))
      // this.pesan.showToast("Gagal Masuk, Coba Lagi.", 'bottom', 'danger')
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
