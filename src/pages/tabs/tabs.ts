import { Nav } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';

// import { PembelianPage } from '../pembelian/pembelian';
import { PenjualanPage } from '../penjualan/penjualan';
// import { PembayaranPage } from '../pembayaran/pembayaran';
import { ProdukPage } from '../produk/produk';
import { ReturnPage } from '../return/return';
import { NotaPage } from '../nota/nota';
import { TransaksiPage } from '../transaksi/transaksi';
// import { KasbonPage } from '../kasbon/kasbon';
import { PiutangPage } from '../piutang/piutang';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild("tabs") tabs: Tabs;

  tab1Root: any = HomePage;
  tab2Root: any = PenjualanPage;
  tab3Root: any = ReturnPage;
  tab4Root: any = TransaksiPage;
  tab5Root: any = NotaPage;
  tab6Root: any = ProdukPage;
  tab7Root: any = PiutangPage;
  // tab8Root: any = PiutangPage;
  // tab9Root: any = KasbonPage;

  title1 = "Home";
  title2 = "Penjualan";
  title3 = "Return";
  title4 = "Transaksi";
  title5 = "Nota";
  title6 = "Produk";
  title7 = "Piutang";
  // title8 = "Piutang";
  // title9 = "Kasbon";

  icon1 = "md-clipboard";
  icon2 = "md-cash";
  icon3 = "md-cart";
  icon4 = "md-cube";
  icon5 = "md-exit";
  icon6 = "md-card";
  icon7 = "md-git-compare";
  // icon8 = "md-closed-captioning";
  // icon9 = "md-card";
 
  tab1 = true;
  tab2 = true;
  tab3 = true;
  tab4 = true;
  tab5 = true;
  tab6 = true;
  tab7 = true;
  // tab8 = true;
  // tab9 = true;

   userData;

  constructor(
    private nav: Nav,
    private storage: StorageProvider,
    private pesan: PesanProvider
  ) { 
    storage.getStorage('user:data').then(data => {
      console.log('datane', data.submenu);

      // Cek apakah data dan submenu ada
      if (!data || !data.submenu || !Array.isArray(data.submenu)) {
        console.error('User data or submenu not found, redirecting to login');
        this.nav.setRoot(LoginPage);
        return;
      }
      this.userData = data;
      this.tab1 = data.submenu[0] && data.submenu[0].r == '1';
      this.tab2 = data.submenu[1] && data.submenu[1].r == '1';
      this.tab3 = data.submenu[2] && data.submenu[2].r == '1';
      this.tab4 = data.submenu[3] && data.submenu[3].r == '1';
      this.tab5 = data.submenu[4] && data.submenu[4].r == '1'; 
      this.tab6 = data.submenu[5] && data.submenu[5].r == '1';
      this.tab7 = data.submenu[6] && data.submenu[6].r == '1';
      // this.tab8 = data.submenu[7].r == '1';
      // this.tab9 = data.submenu[8].r == '1';
     // this.tab8 = data.submenu[7].r == '1';
      // this.tab4Root = TransaksiPage;
      // this.title4 = "Transaksi";
      // this.icon4 = "logo-bitcoin";
      let v = this.userData.submenu.find(v => v.r == '1');
       if (v && this.tabs) {
        this.tabs.select(this.userData.submenu.indexOf(v));
      }

      // let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'pembayaran'))];
      // this.title2 = submenuPembayaran.c != '1' || submenuPembayaran.u != '1'? 'Nota' : 'Pembayaran';
      // this.icon2 = submenuPembayaran.c != '1' || submenuPembayaran.u != '1'? 'md-copy' : 'md-cash';
    }).catch(err => {
      console.error('Error loading user data in tabs:', err);
      this.nav.setRoot(LoginPage);
    });
  }

  logout(){
    this.pesan.showConfirm("Yakin Ingin Keluar?", '').then(data => {
      if(data){
        this.storage.removeStorage("user:data").then(data => {
      	  this.nav.setRoot(LoginPage);
        })
      }
    })
  }
}
