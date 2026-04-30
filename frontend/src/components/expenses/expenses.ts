import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";

export class Expenses {
    private openNewRoute: Function;
    private currentDeleteId: number | null;

    private overlayElement: HTMLElement | null;
    private popupElement: HTMLElement | null;
    private confirmElement: HTMLElement | null;
    private cancelElement: HTMLElement | null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.currentDeleteId = null;

        this.overlayElement = null;
        this.popupElement = null;
        this.confirmElement = null;
        this.overlayElement = null;
        this.cancelElement = null;

        this.getExpenses();
        this.initPopupHandlers();
    }

    private initPopupHandlers(): void {
        this.overlayElement = document.getElementById('expenseOverlay');
        this.popupElement = document.getElementById('expensePopup');
        this.confirmElement = document.getElementById('confirmDelete');
        this.cancelElement = document.getElementById('cancelDelete');

        if (this.confirmElement) {
            this.confirmElement.addEventListener('click', this.confirmDelete.bind(this));
        }
        if (this.cancelElement) {
            this.cancelElement.addEventListener('click', this.cancelDelete.bind(this));
        }
    }

    private showPopup(id: number): void {
        this.currentDeleteId = id;
        if (this.overlayElement) this.overlayElement.style.display = 'block';
        if (this.popupElement) this.popupElement.style.display = 'block';
    }

    private hidePopup(): void {
        this.currentDeleteId = null;
        if (this.overlayElement) this.overlayElement.style.display = 'none';
        if (this.popupElement) this.popupElement.style.display = 'none';
    }

    private async confirmDelete(): Promise<void> {
        if (!this.currentDeleteId) return;

        const result: HttpRequestResult<DefaultResponseType> = await HttpUtils.request('/categories/expense/' + this.currentDeleteId, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            alert('Возникла ошибка при удалении расхода. Обратитесь в поддержку.');
            if (result.redirect) {
                this.openNewRoute('/login');
            }
            this.hidePopup();
            return;
        }

        this.hidePopup();
        this.openNewRoute('/expenses');
    }

    private cancelDelete(): void {
        this.hidePopup();
    }

    private async getExpenses(): Promise<void> {
        const result: HttpRequestResult<CategoryResponseType[] | DefaultResponseType> = await HttpUtils.request('/categories/expense');

        if (result.redirect || result.error || !result.response || (result.response && (result.response as DefaultResponseType).error)) {
            alert('Возникла ошибка при запросе расходов. Обратитесь в поддержку.')
            if (result.redirect) {
                this.openNewRoute('/login');
                return;
            }
        }

        this.showExpenses(result.response as CategoryResponseType[]);
    }

    private showExpenses(expenses: CategoryResponseType[]): void {
        const expensesRecords: HTMLElement | null = document.getElementById('expenses-records');
        if (!expensesRecords) return;
        expensesRecords.innerHTML = '';

        for (let i = 0; i < expenses.length; i++) {
            const expense: CategoryResponseType | undefined = expenses[i];
            if (!expense) continue;

            const expensesRecord: HTMLElement = document.createElement('div');
            expensesRecord.className = 'py-4 ps-4 border rounded income';

            const expenseTitle: HTMLElement = document.createElement('h2');
            expenseTitle.className = 'text-primary-emphasis mb-3';
            expenseTitle.innerText = expense.title;

            const expenseActions: HTMLElement = document.createElement('div');
            expenseActions.className = 'd-flex gap-2';

            const expenseEdit: HTMLAnchorElement = document.createElement('a');
            expenseEdit.className = 'btn btn-primary px-3 py-2';
            expenseEdit.href = '/expenses/edit?id=' + expense.id;
            expenseEdit.innerText = 'Редактировать';

            const expenseDelete: HTMLElement = document.createElement('button');
            expenseDelete.className = 'btn btn-danger px-3 py-2';
            expenseDelete.innerText = 'Удалить';
            expenseDelete.dataset.id = expense.id.toString();
            expenseDelete.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPopup(expense.id);
            });

            expenseActions.appendChild(expenseEdit);
            expenseActions.appendChild(expenseDelete);
            expensesRecord.appendChild(expenseTitle);
            expensesRecord.appendChild(expenseActions);
            expensesRecords.appendChild(expensesRecord);
        }

        const createRecordElement: HTMLElement = document.createElement('div');
        createRecordElement.className = 'py-4 ps-4 border rounded income d-flex justify-content-center align-items-center';

        const createRecordLink: HTMLAnchorElement = document.createElement('a');
        createRecordLink.href = '/expenses/create';

        const createRecordIcon: HTMLElement = document.createElement('i');
        createRecordIcon.className = 'bi bi-plus-lg text-secondary';
        
        createRecordLink.appendChild(createRecordIcon);
        createRecordElement.appendChild(createRecordLink);
        expensesRecords.appendChild(createRecordElement);
    }
}