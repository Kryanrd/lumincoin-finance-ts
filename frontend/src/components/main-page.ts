import type { DefaultResponseType } from "../types/default-response.type";
import type { HttpRequestResult } from "../types/http-request-result.type";
import type { OperationResponseType } from "../types/operation-response.type";
import { HttpUtils } from "../utils/http-utils";
import Chart from 'chart.js/auto';

export class MainPage {
    private openNewRoute: Function;
    private filterButtons: NodeListOf<Element>;
    private intervalBlock: HTMLElement | null;
    private dateFromInput: HTMLInputElement | null;
    private dateToInput: HTMLInputElement | null;
    private currentPeriod: string | null;
    private incomeChart: any;
    private expenseChart: any;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        this.filterButtons = document.querySelectorAll('.btn-filter');
        this.intervalBlock = document.getElementById('interval-dates');
        this.dateFromInput = document.getElementById('dateFrom') as HTMLInputElement;
        this.dateToInput = document.getElementById('dateTo') as HTMLInputElement;
        this.currentPeriod = '';


        if (this.dateFromInput && this.dateToInput) {
            (this.dateFromInput as HTMLInputElement).disabled = true;
            (this.dateToInput as HTMLInputElement).disabled = true;
        }

        this.initCharts();

        this.initFilters();
        this.loadOperations();
    }

    private initFilters(): void {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period: string | null = btn.getAttribute('data-period');
                if (period === 'interval') {
                    this.currentPeriod = 'interval';
                    if (this.dateFromInput && this.dateToInput) {
                        (this.dateFromInput as HTMLInputElement).disabled = false;
                        (this.dateToInput as HTMLInputElement).disabled = false;
                    }

                    this.setActiveFilter(btn as HTMLElement);

                    if (this.dateFromInput && this.dateToInput) {
                        if (this.dateFromInput.value && this.dateToInput.value) {
                            this.loadOperations('interval', this.dateFromInput.value, this.dateToInput.value);
                        }
                    }

                } else if (period === 'year') {
                    const currentYear: number = new Date().getFullYear();
                    const dateFrom: string = `${currentYear}-01-01`;
                    const dateTo: string = `${currentYear}-12-31`;
                    this.setActiveFilter(btn as HTMLElement);
                    this.loadOperations('interval', dateFrom, dateTo);
                } else {
                    (this.dateFromInput as HTMLInputElement).disabled = true;
                    (this.dateToInput as HTMLInputElement).disabled = true;
                    if (this.currentPeriod) {
                        this.currentPeriod = period;
                    }

                    this.setActiveFilter(btn as HTMLElement);
                    this.loadOperations(period);
                }
            });
        });

        if (this.dateFromInput && this.dateToInput) {
            const onDateChange = () => {
                if (this.dateFromInput && this.dateToInput) {
                    if (this.currentPeriod === 'interval' &&
                        this.dateFromInput.value &&
                        this.dateToInput.value) {
                        this.loadOperations('interval', this.dateFromInput.value, this.dateToInput.value);
                    }
                }
            };

            this.dateFromInput.addEventListener('change', onDateChange);
            this.dateToInput.addEventListener('change', onDateChange);
        }
    }

    private setActiveFilter(activeBtn: HTMLElement | null): void {
        this.filterButtons.forEach(btn => {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-outline-secondary');
        });
        if (activeBtn) {
            activeBtn.classList.remove('btn-outline-secondary');
            activeBtn.classList.add('btn-secondary');
        }
    }

    private async loadOperations(period: string | null = null, dateFrom: string | null = null, dateTo: string | null = null): Promise<void> {
        let url: string = '/operations?';
        if (period && period !== 'interval') {
            url += `period=${period}`;
        } else if (period === 'interval' && dateFrom && dateTo) {
            url += `period=${period}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        } else if (!period) {
            url += `period=today`;
        } else {
            return;
        }

        const result: HttpRequestResult<OperationResponseType[] | DefaultResponseType> = await HttpUtils.request(url);

        if (result.redirect || result.error || !result.response || (result.response && (result.response as DefaultResponseType).error)) {
            alert('Ошибка загрузки операций');
            if (result.redirect) this.openNewRoute('/login');
            return;
        }

        this.updateChartsWithOperations(result.response as OperationResponseType[]);
    }

    private updateChartsWithOperations(operations: OperationResponseType[]): void {
        const incomeMap = new Map<string, number>();
        const expenseMap = new Map<string, number>();

        for (const op of operations) {
            const category: string = op.category || 'Без категории';
            const amount: number = Number(op.amount) || 0;

            if (op.type === 'income') {
                incomeMap.set(category, (incomeMap.get(category) || 0) + amount);
            } else if (op.type === 'expense') {
                expenseMap.set(category, (expenseMap.get(category) || 0) + amount);
            }
        }

        const incomeCategories = Array.from(incomeMap.keys());
        const incomeAmounts = Array.from(incomeMap.values());
        const expenseCategories = Array.from(expenseMap.keys());
        const expenseAmounts = Array.from(expenseMap.values());

        const getColors = (count: number) => {
            const palette = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'aqua', 'pink'];
            return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
        };

        this.incomeChart.data.labels = incomeCategories;
        this.incomeChart.data.datasets[0].data = incomeAmounts;
        this.incomeChart.data.datasets[0].backgroundColor = getColors(incomeCategories.length);
        this.incomeChart.update();

        this.expenseChart.data.labels = expenseCategories;
        this.expenseChart.data.datasets[0].data = expenseAmounts;
        this.expenseChart.data.datasets[0].backgroundColor = getColors(expenseCategories.length);
        this.expenseChart.update();
    }


    private initCharts(): void {
        const incomeCanvas: HTMLElement | null = document.getElementById('incomeChart');
        const expenseCanvas: HTMLElement | null = document.getElementById('expenseChart');

        if (incomeCanvas && incomeCanvas instanceof HTMLCanvasElement) {
            const incomeCtx = incomeCanvas.getContext('2d');
            if (incomeCtx) {
                this.incomeChart = new Chart(incomeCtx, {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: [],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: false,
                        plugins: {
                            legend: { position: 'top', labels: { boxWidth: 35, font: { size: 12 }, color: 'black' } },
                            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} $` } }
                        }
                    }
                });
            }
        }

        if (expenseCanvas && expenseCanvas instanceof HTMLCanvasElement) {
            const expenseCtx = expenseCanvas.getContext('2d');
            if (expenseCtx) {
                this.expenseChart = new Chart(expenseCtx, {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: [],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: false,
                        plugins: {
                            legend: { position: 'top', labels: { boxWidth: 35, font: { size: 12 }, color: 'black' } },
                            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} $` } }
                        }
                    }
                });
            }
        }
    }
}