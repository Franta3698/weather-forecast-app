
import { Component, input, AfterViewInit, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);
@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss'
})
export class TemperatureChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  temperatures = input.required<number[]>();
  times = input.required<string[]>();

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.createChart();
  }

  ngOnChanges(): void {
  if (!this.viewInitialized || !this.chart) return;

  this.chart.data.labels = this.times();
  this.chart.data.datasets[0].data = this.temperatures();
  this.chart.update();
}

  createChart(): void {
    if (!this.chartCanvas) return;


    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.times(),
        datasets: [{
          label: 'Teplota (°C)',
          data: this.temperatures(),
          borderColor: '#3880ff',
          backgroundColor: 'rgba(56, 128, 255, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          datalabels: {
            align: 'top',
            anchor: 'end',
            color: '#3880ff',
            font: {
              weight: 'bold',
              size: 11
            },
            formatter: (value) => `${value} °C`
          }
        },

        scales: {
          y: {
            title: {
              display: true,
              text: 'Teplota (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Čas'
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
