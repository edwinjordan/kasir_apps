import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('salesChart') salesChart;
  @ViewChild('productChart') productChart;

  userData;
  operator;

  // Dashboard Statistics
  todaySales: number = 0;
  weekSales: number = 0;
  monthSales: number = 0;
  todayTransactions: number = 0;

  // Charts
  salesLineChart: any;
  productBarChart: any;

  // Data
  salesData: any[] = [];
  topProducts: any[] = [];

  // Period selection
  selectedPeriod: string = 'week'; // week, month, year
  periodOptions = [
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' }
  ];

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
  	) {
  }

  ionViewDidLoad(){
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      this.operator = this.userData;
      
      // Load dashboard data
      this.loadDashboardData();
    })
  }

  /**
   * Load all dashboard data
   */
  async loadDashboardData() {
    const loading = this.pesan.showLoading('Memuat data dashboard...');
    
    try {
      await Promise.all([
        this.loadStatistics(),
        this.loadSalesChart(),
        this.loadTopProducts()
      ]);
      loading.dismiss();
    } catch (error) {
      loading.dismiss();
      console.error('Error loading dashboard:', error);
      this.pesan.showToast('Gagal memuat data dashboard', 'top', 'danger');
    }
  }

  /**
   * Load sales statistics
   */
  async loadStatistics() {
    try {
      // Call API to get statistics
      const url = this.server.serverUrl + 'dashboard/statistics';
      const stats = await this.server.getRequest(url);
      
      if (stats && stats.success) {
        this.todaySales = stats.data.today_sales || 0;
        this.weekSales = stats.data.week_sales || 0;
        this.monthSales = stats.data.month_sales || 0;
        this.todayTransactions = stats.data.today_transactions || 0;
      } else {
        // Mock data jika API belum ada
        this.generateMockStatistics();
      }
    } catch (error) {
      console.log('Statistics API not available, using mock data');
      this.generateMockStatistics();
    }
  }

  /**
   * Generate mock statistics for development
   */
  generateMockStatistics() {
    this.todaySales = Math.floor(Math.random() * 5000000) + 1000000;
    this.weekSales = Math.floor(Math.random() * 25000000) + 5000000;
    this.monthSales = Math.floor(Math.random() * 100000000) + 20000000;
    this.todayTransactions = Math.floor(Math.random() * 50) + 10;
  }

  /**
   * Load sales chart data
   */
  async loadSalesChart() {
    try {
      // Call API based on selected period
      const url = this.server.serverUrl + `dashboard/sales-chart/${this.selectedPeriod}`;
      const chartData = await this.server.getRequest(url);
      
      if (chartData && chartData.success) {
        this.salesData = chartData.data;
        this.createSalesChart(chartData.data);
      } else {
        this.generateMockSalesData();
      }
    } catch (error) {
      console.log('Sales chart API not available, using mock data');
      this.generateMockSalesData();
    }
  }

  /**
   * Generate mock sales data
   */
  generateMockSalesData() {
    const labels = [];
    const data = [];
    const days = this.selectedPeriod === 'week' ? 7 : this.selectedPeriod === 'month' ? 30 : 12;
    
    for (let i = days - 1; i >= 0; i--) {
      if (this.selectedPeriod === 'year') {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        labels.push(month.toLocaleDateString('id-ID', { month: 'short' }));
      } else {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
      }
      data.push(Math.floor(Math.random() * 5000000) + 500000);
    }
    
    this.createSalesChart({ labels, data });
  }

  /**
   * Create sales line chart
   */
  createSalesChart(chartData: any) {
    if (this.salesLineChart) {
      this.salesLineChart.destroy();
    }

    const ctx = this.salesChart.nativeElement.getContext('2d');
    
    this.salesLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Penjualan',
          data: chartData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function(value) {
                return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
              }
            }
          }],
          xAxes: [{
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
              return 'Rp ' + tooltipItem.yLabel.toLocaleString('id-ID');
            }
          }
        }
      }
    });
  }

  /**
   * Load top products data
   */
  async loadTopProducts() {
    try {
      const url = this.server.serverUrl + `dashboard/top-products/${this.selectedPeriod}`;
      const productsData = await this.server.getRequest(url);
      
      if (productsData && productsData.success) {
        this.topProducts = productsData.data.slice(0, 5);
        this.createProductChart(productsData.data.slice(0, 5));
      } else {
        this.generateMockProductData();
      }
    } catch (error) {
      console.log('Top products API not available, using mock data');
      this.generateMockProductData();
    }
  }

  /**
   * Generate mock product data
   */
  generateMockProductData() {
    const mockProducts = [
      { name: 'Produk A', qty: Math.floor(Math.random() * 200) + 50, revenue: Math.floor(Math.random() * 10000000) + 1000000 },
      { name: 'Produk B', qty: Math.floor(Math.random() * 180) + 40, revenue: Math.floor(Math.random() * 9000000) + 900000 },
      { name: 'Produk C', qty: Math.floor(Math.random() * 160) + 30, revenue: Math.floor(Math.random() * 8000000) + 800000 },
      { name: 'Produk D', qty: Math.floor(Math.random() * 140) + 20, revenue: Math.floor(Math.random() * 7000000) + 700000 },
      { name: 'Produk E', qty: Math.floor(Math.random() * 120) + 10, revenue: Math.floor(Math.random() * 6000000) + 600000 }
    ];
    
    this.topProducts = mockProducts;
    this.createProductChart(mockProducts);
  }

  /**
   * Create product bar chart
   */
  createProductChart(products: any[]) {
    if (this.productBarChart) {
      this.productBarChart.destroy();
    }

    const ctx = this.productChart.nativeElement.getContext('2d');
    
    this.productBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: products.map(p => p.name),
        datasets: [{
          label: 'Jumlah Terjual',
          data: products.map(p => p.qty),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  /**
   * Change period and reload charts
   */
  async onPeriodChange() {
    await this.loadSalesChart();
    await this.loadTopProducts();
  }

  /**
   * Refresh dashboard data
   */
  async refresh(refresher) {
    await this.loadDashboardData();
    refresher.complete();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  /**
   * Format to millions
   */
  formatToMillions(amount: number): string {
    return 'Rp ' + (amount / 1000000).toFixed(1) + 'M';
  }

  /**
   * Get current date formatted
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Get current month name
   */
  getCurrentMonth(): string {
    return new Date().toLocaleDateString('id-ID', { 
      month: 'long', 
      year: 'numeric' 
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
