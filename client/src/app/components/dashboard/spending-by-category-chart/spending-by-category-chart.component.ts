import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartData, ChartEvent, ChartOptions, DoughnutController, ArcElement, Tooltip, Legend, Title } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title);

export interface CategorySlice {
  label: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-spending-by-category-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-by-category-chart.component.html',
  styleUrls: ['./spending-by-category-chart.component.scss']
})
export class SpendingByCategoryChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() data: CategorySlice[] = [];
  @Input() monthTotal = 0;
  @Output() categorySelected = new EventEmitter<string>();

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('legend', { static: true }) legendEl!: ElementRef<HTMLDivElement>;

  private chart: Chart | null = null;
  private observer?: IntersectionObserver;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) return;
    // Update chart when inputs change
    const { labels, values, palette } = this.computeChartData();
    this.chart.data.labels = labels as any;
    const ds: any = this.chart.data.datasets?.[0];
    if (ds) {
      ds.data = values;
      ds.backgroundColor = palette;
    }
    this.chart.update();
    this.rebuildLegend(labels, palette);
  }

  ngAfterViewInit(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.initChart();
            this.observer?.disconnect();
          }
        });
      }, { threshold: 0.2 });
      this.observer.observe(this.canvas.nativeElement);
    } else {
      this.initChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.observer?.disconnect();
  }

  private buildPalette(n: number): string[] {
    const base = [
      '#3b82f6', '#22c55e', '#f59e0b', '#a78bfa', '#ef4444', '#14b8a6', '#f472b6', '#8b5cf6'
    ];
    const arr: string[] = [];
    for (let i = 0; i < n; i++) arr.push(base[i % base.length]);
    return arr;
  }

  private computeChartData(): { labels: string[]; values: number[]; palette: string[] } {
    let labels = this.data.map((d) => d.label);
    let values = this.data.map((d) => d.total);
    const hasData = values.some((v) => v > 0);
    if (!labels.length || !hasData) {
      labels = ['No data'];
      values = [1];
    }
    const palette = hasData ? this.buildPalette(values.length) : ['#e5e7eb'];
    return { labels, values, palette };
  }

  private initChart(): void {
    if (this.chart) return;
    const { labels, values, palette } = this.computeChartData();

    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart: any) => {
        const { width, height, ctx } = chart;
        ctx.save();
        ctx.font = '600 16px var(--font-sans)';
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(this.monthTotal), (width / 2), (height / 2));
        ctx.restore();
      }
    } as any;

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const i = ctx.dataIndex || 0;
              const c = this.data[i];
              const pct = this.monthTotal > 0 ? ((c.total / this.monthTotal) * 100) : 0;
              return `${c.label}: ${new Intl.NumberFormat().format(c.total)} (${pct.toFixed(1)}%), ${c.count} tx`;
            }
          }
        },
        title: { display: false }
      },
      cutout: '60%'
    };

    this.chart = new Chart(this.canvas.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: palette,
            hoverOffset: 6,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.6)'
          }
        ]
      } as ChartData<'doughnut'>,
      options,
      plugins: [centerTextPlugin]
    });

    this.canvas.nativeElement.addEventListener('click', (evt: MouseEvent) => {
      if (!this.chart) return;
      const points = this.chart.getElementsAtEventForMode(evt as unknown as Event, 'nearest', { intersect: true }, true);
      if (points?.length) {
        const idx = (points[0] as any).index;
        const label = labels[idx];
        if (label !== 'No data') {
          this.categorySelected.emit(label);
        }
      }
    });

    this.rebuildLegend(labels, palette);
  }

  private rebuildLegend(labels: string[], palette: string[]): void {
    const legend = this.legendEl.nativeElement;
    legend.innerHTML = '';
    labels.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'legend-btn';
      btn.style.setProperty('--swatch', palette[i]);
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = label;
      btn.onclick = () => {
        if (!this.chart) return;
        if (label === 'No data') return;
        this.chart.toggleDataVisibility(i);
        const visible = this.chart.getDataVisibility(i);
        btn.setAttribute('aria-pressed', visible ? 'true' : 'false');
        this.chart.update();
      };
      btn.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      };
      legend.appendChild(btn);
    });
  }
}
