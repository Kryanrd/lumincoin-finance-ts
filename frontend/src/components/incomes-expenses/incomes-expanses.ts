import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import type { OperationResponseType } from "../../types/operation-response.type";
import { HttpUtils } from "../../utils/http-utils";
import { LayoutUtils } from "../../utils/layout-utils";

export class IncomesExpenses {
    private openNewRoute: Function;
    private currentDeleteId: string | null;
    private tableBody: HTMLElement | null;
    private currentPeriod: string | null;
    private dateFromInput: HTMLInputElement | null = null;
    private dateToInput: HTMLInputElement | null = null;
    private intervalBlock: HTMLElement | null = null;
    private filterButtons: NodeListOf<Element> | null = null;
    private overlay: HTMLElement | null = null;
    private popup: HTMLElement | null = null;
    private confirmBtn: HTMLElement | null = null;
    private cancelBtn: HTMLElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.currentDeleteId = null;

        this.findElements();

        this.tableBody = document.querySelector('#incomes-expenses-table tbody');
        this.currentPeriod = 'today';

        if (this.dateFromInput && this.dateToInput) {
            this.dateFromInput.disabled = true;
            this.dateToInput.disabled = true;
        }

        this.initFilters();
        this.initPopup();
        this.loadOperations();
    }

    private findElements(): void {
        this.filterButtons = document.querySelectorAll('.btn-filter');
        this.intervalBlock = document.getElementById('interval-dates');
        this.dateFromInput = document.getElementById('dateFrom') as HTMLInputElement;
        this.dateToInput = document.getElementById('dateTo') as HTMLInputElement;

        this.overlay = document.getElementById('ieOverlay');
        this.popup = document.getElementById('iePopup');
        this.confirmBtn = document.getElementById('confirmDelete');
        this.cancelBtn = document.getElementById('cancelDelete');
    }

    private initFilters(): void {
        if (!this.filterButtons) return;
        this.filterButtons.forEach((btn) => {
            btn.addEventListener('click', (e: Event) => {
                const period: string | null = btn.getAttribute('data-period');
                if (period === 'interval') {
                    this.currentPeriod = 'interval';

                    if (this.dateFromInput && this.dateToInput) {
                        this.dateFromInput.disabled = false;
                        this.dateToInput.disabled = false;
                        this.setActiveFilter(btn as HTMLElement);
                        if (this.dateFromInput.value && this.dateToInput.value) {
                            this.loadOperations('interval', this.dateFromInput.value, this.dateToInput.value);
                        }
                    }

                } else if (period === 'year') {
                    const currentYear: number = new Date().getFullYear();
                    const dateFrom: string = `${currentYear}-01-01`;
                    const dateTo: string = `${currentYear}-12-31`;
                    this.loadOperations('interval', dateFrom, dateTo);
                    this.setActiveFilter(btn as HTMLElement);
                } else {
                    if (this.dateFromInput && this.dateToInput && this.currentPeriod) {
                        this.dateFromInput.disabled = true;
                        this.dateToInput.disabled = true;
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

    private setActiveFilter(activeBtn: HTMLElement): void {
        if (!this.filterButtons) return;
        this.filterButtons.forEach(btn => {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-outline-secondary');
        });
        activeBtn.classList.remove('btn-outline-secondary');
        activeBtn.classList.add('btn-secondary');
    }

    private initPopup(): void {
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', this.confirmDelete.bind(this));
        }
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', this.hidePopup.bind(this));
        }
    }

    private showPopup(id: string): void {
        this.currentDeleteId = id;
        if (this.overlay) this.overlay.style.display = 'block';
        if (this.popup) this.popup.style.display = 'block';
    }

    private hidePopup(): void {
        this.currentDeleteId = null;
        if (this.overlay) this.overlay.style.display = 'none';
        if (this.popup) this.popup.style.display = 'none';
    }

    private async confirmDelete(): Promise<void> {
        if (!this.currentDeleteId) return;

        const result: HttpRequestResult<DefaultResponseType> = await HttpUtils.request('/operations/' + this.currentDeleteId, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            alert('Ошибка при удалении операции');
            if (result.redirect) this.openNewRoute('/login');
            this.hidePopup();
            return;
        }

        this.hidePopup();

        await LayoutUtils.updateBalance(this.openNewRoute);

        if (this.dateFromInput && this.dateToInput) {
            if (this.currentPeriod === 'interval') {
                this.loadOperations('interval', this.dateFromInput.value, this.dateToInput.value);
            } else {
                this.loadOperations(this.currentPeriod);
            }
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

        this.renderTable(result.response as OperationResponseType[]);
    }

    private renderTable(operations: OperationResponseType[]): void {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = '';

        if (!operations || operations.length === 0) {
            const emptyRow: HTMLElement = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">Нет операций</td>';
            this.tableBody.appendChild(emptyRow);
            return;
        }

        operations.forEach((operation) => {
            const row: HTMLTableRowElement = document.createElement('tr');
            row.className = 'text-center';

            const th: HTMLTableCellElement = document.createElement('th');
            th.scope = 'row';
            th.className = 'p-3';
            th.innerText = operation.id.toString();
            row.appendChild(th);

            const typeCell = document.createElement('td');
            typeCell.className = operation.type === 'income' ? 'text-success p-3' : 'text-danger p-3';
            typeCell.innerText = operation.type === 'income' ? 'доход' : 'расход';
            row.appendChild(typeCell);

            const categoryCell = document.createElement('td');
            categoryCell.className = 'p-3';
            categoryCell.innerText = operation.category ? operation.category : 'Без категории';;
            row.appendChild(categoryCell);

            const amountCell: HTMLTableCellElement = document.createElement('td');
            amountCell.className = 'p-3';
            amountCell.innerText = operation.amount ? operation.amount + '$' : '';
            row.appendChild(amountCell);

            const dateCell: HTMLTableCellElement = document.createElement('td');
            dateCell.className = 'p-3';
            dateCell.innerText = new Date(operation.date).toLocaleDateString();
            row.appendChild(dateCell);


            const commentCell: HTMLTableCellElement = document.createElement('td');
            commentCell.className = 'd-flex justify-content-end gap-2 p-3';
            commentCell.innerHTML = `
                <span class="me-auto">${operation.comment || ''}</span>
                <a href="#" class="delete-operation" data-id="${operation.id}">
                    <i class="bi bi-trash text-black"></i>
                </a>
                <a href="/incomes-expenses/edit?id=${operation.id}&type=${operation.type}">
                    <i class="bi bi-pencil text-black"></i>
                </a>
            `;
            row.appendChild(commentCell);
            if (!this.tableBody) return;
            this.tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-operation').forEach(btn => {
            btn.addEventListener('click', (e: Event) => {
                e.preventDefault();
                const id: string | null = btn.getAttribute('data-id');
                if (id) this.showPopup(id);
            });
        });
    }
}