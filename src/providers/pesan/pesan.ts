import { Injectable } from '@angular/core';
import { ToastController, Toast, AlertController, LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';

import { ServerProvider } from '../server/server';
import { StorageProvider } from '../storage/storage';


@Injectable()
export class PesanProvider {

	toastV : Toast;
  constructor(
  	private toast: ToastController,
  	private alert: AlertController,
  	private loading: LoadingController,
  	private server: ServerProvider,
  	private storage: StorageProvider) {}

  public showLoading(title){
  	let loading = this.loading.create({
  		content: title
  	});
  	loading.present();
  	return loading;
  }

  public showToast(text, position = 'bottom', type = '', duration = 3000, cek = false){

  	// if(cek){
  	// 	try{
  	// 		this.toastV.dismiss()
  	// 	}catch(e){}
  	// }

  	this.toastV = this.toast.create({
	    message: text,
	    duration: duration,
	    position: position,
	    cssClass: type + '-toast',
	    showCloseButton: true,
	    closeButtonText: 'OK'
	  });
	  this.toastV.present();

	  return this.toastV;
  }

  public showAlert(title, subtitle): Promise<boolean>{
  	return new Promise((resolve, reject) => {
	  	this.alert.create({
		    title: title,
		    subTitle: subtitle,
		    buttons: [{
	        text: 'Ok',
	        handler: _=> resolve(true)
	      }]
	  	}).present();
  	})
  }

  public showConfirm(title, subtitle, ybtn = 'Ya, Lanjut'): Promise<boolean>{
  	return new Promise((resolve, reject) => {
	  	this.alert.create({
		    title: title,
		    message: subtitle,
		    buttons: [
		      {
		        text: 'Tidak',
		        role: 'cancel',
		        handler: _=> resolve(false)
		      },
		      {
		        text: ybtn,
		        handler: _=> resolve(true)
		      }
		    ]
		  }).present();
  	})
  }

  public showInput(title, subtitle, input: Array<Object>): Promise<any>{
  	return new Promise((resolve, reject) => {
	  	this.alert.create({
		    title: title,
		    inputs: input,
		    buttons: [
		      {
		        text: 'Batal',
		        role: 'cancel',
		        handler: _=> resolve({success: false, data: null})
		      },
		      {
		        text: 'Simpan',
		        handler: data => {
		        	resolve({success: true, data: data})
		        }
		      }
		    ]
		  }).present();
  	})
  }

  public showOption(title, options: Array<any>): Promise<any>{
  	return new Promise((resolve, reject) => {
	  	let alert = this.alert.create({
		   	title: title,
		   	inputs: options,
		    buttons: [{
		    	text: 'Batal',
		    	role: 'cancel',
		    	handler: data => {
		    		resolve({success: false, data: null})
		    	}
		    }, {
		    	text: 'OK',
		    	handler: data => {
		    		resolve({success: true, data: data})
		    	}
		    }]
		  }).present();
  	})
  }

  public changeServerUrl(){
  	return new Promise((resolve, reject) => {
  		this.storage.getStorage('server:url').then(data => {
  			console.log(data);
  			if(data){
	  			data = data.includes('://')? data.split('://')[1] : data;
	  			data = data.slice(0, -1)
  			}
		  	this.alert.create({
			    title: "Edit Server Url",
			    inputs: [{
			        name: 'url',
			        placeholder: '192.168.100.22',
			        value: data
			      }
			    ],
			    buttons: [
			      {
			        text: 'Batal',
			        role: 'cancel',
			        handler: _=> reject()
			      },
			      {
			        text: 'Simpan',
			        handler: data => {
			        	resolve(data.url)
			        }
			      }
			    ]
			  }).present();
  		})
  	})
  }
}
