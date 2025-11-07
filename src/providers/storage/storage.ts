import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageProvider {

  isLogin = false;
  private storageReady: Promise<any>;

  constructor(public storage: Storage) {
    this.storageReady = this.storage.ready();
  }

  public setStorage(key, isi){
    return this.storageReady.then(() => {
      return this.storage.set(key, isi);
    }).catch(err => {
      console.error('Storage set error:', err);
      return null;
    });
  }

  public getStorage(key){
    return this.storageReady.then(() => {
      return this.storage.get(key);
    }).catch(err => {
      console.error('Storage get error:', err);
      return null;
    });
  }

  public removeStorage(key){
    return this.storageReady.then(() => {
      return this.storage.remove(key);
    }).catch(err => {
      console.error('Storage remove error:', err);
      return null;
    });
  }

  public getAllStorage(){
    return this.storage.ready().then(() => {
      return this.storage.forEach((v, k) => {
        console.log(k + " : " ,v);
      });
    });
  }

}
