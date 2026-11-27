
import {
  Component,
  input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables);
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss'
})
export class TemperatureChartComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  temperatures = input.required<number[]>();
  times = input.required<string[]>();

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

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

          borderWidth: 2,
          fill: 'start',
          tension: 0.4,

          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        layout: {
          padding: {
            top: 20,
            right: 20,
            left: 10,
            bottom: 5
          }
        },

        plugins: {

          legend: {
            display: false
          },

          datalabels: {

            display: (context) => {
              const data = context.dataset.data as number[];
              const index = context.dataIndex;

              const min = Math.min(...data);
              const max = Math.max(...data);

              const range = max - min;
              const threshold = range * 0.25;

              const current = data[index];

              // Denní minimum a maximum
              if (
                index === data.indexOf(min) ||
                index === data.indexOf(max)
              ) {
                return true;
              }

              if (
                index < 2 ||
                index >= data.length - 2
              ) {
                return false;
              }

              const previous = data[index - 2];
              const next = data[index + 2];

              // Lokální maximum nebo minimum
              const isPeak =
                (current > previous && current > next) ||
                (current < previous && current < next);

              const difference = Math.max(
                Math.abs(current - previous),
                Math.abs(current - next)
              );

              return isPeak && difference >= threshold;
            },

            align: 'top',
            anchor: 'end',
            offset: 4,

            color: '#3880ff',

            font: {
              weight: 'bold',
              size: 10
            },

            formatter: (value: number) => `${value}°`
          }
        },

        scales: {

          y: {

            grace: '10%',

            title: {
              display: false
            },

            ticks: {
              maxTicksLimit: 5,
              callback: (value) => `${value}°`
            },

            grid: {
              color: 'rgba(128, 128, 128, 0.15)'
            }
          },

          x: {

            title: {
              display: false
            },

            ticks: {
              autoSkip: true,
              maxTicksLimit: 6,
              maxRotation: 0,
              minRotation: 0,

              font: {
                size: 10
              }
            },

            grid: {
              display: false
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
