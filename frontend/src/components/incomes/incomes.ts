import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";

export class Incomes {
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

        this.getIncomes();
        this.initPopupHandlers();
    }

    private initPopupHandlers(): void {
        this.overlayElement = document.getElementById('incomesOverlay');
        this.popupElement = document.getElementById('incomesPopup');
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

        const result: HttpRequestResult<DefaultResponseType> = await HttpUtils.request('/categories/income/' + this.currentDeleteId, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            alert('Возникла ошибка при удалении расхода. Обратитесь в поддержку.');
            if (result.redirect) {
                this.openNewRoute('/login');
            }
            this.hidePopup();
            return;
        }

        this.hidePopup();
        this.openNewRoute('/incomes');
    }

    private cancelDelete(): void {
        this.hidePopup();
    }

    private async getIncomes(): Promise<void> {
        const result: HttpRequestResult<CategoryResponseType[] | DefaultResponseType> = await HttpUtils.request('/categories/income');

        if (result.redirect || result.error || !result.response || (result.response && (result.response as DefaultResponseType).error)) {
            alert('Возникла ошибка при запросе расходов. Обратитесь в поддержку.')
            if (result.redirect) {
                this.openNewRoute('/login');
            }
        }

        this.showIncomes(result.response as CategoryResponseType[]);
    }

    private showIncomes(incomes: CategoryResponseType[]): void {
        const incomesRecords: HTMLElement | null = document.getElementById('incomesRecords');
        if (!incomesRecords) return;
        incomesRecords.innerHTML = '';

        for (let i = 0; i < incomes.length; i++) {
            const income: CategoryResponseType | undefined = incomes[i];
            if (!income) continue;

            const incomesRecord: HTMLElement = document.createElement('div');
            incomesRecord.className = 'py-4 ps-4 border rounded income';

            const incomeTitle: HTMLElement = document.createElement('h2');
            incomeTitle.className = 'text-primary-emphasis mb-3';
            incomeTitle.innerText = income.title;

            const incomeActions: HTMLElement = document.createElement('div');
            incomeActions.className = 'd-flex gap-2';

            const incomeEdit: HTMLAnchorElement = document.createElement('a');
            incomeEdit.className = 'btn btn-primary px-3 py-2';
            incomeEdit.href = '/incomes/edit?id=' + income.id;
            incomeEdit.innerText = 'Редактировать';

            const incomeDelete: HTMLElement = document.createElement('button');
            incomeDelete.className = 'btn btn-danger px-3 py-2';
            incomeDelete.innerText = 'Удалить';
            incomeDelete.dataset.id = income.id.toString();
            incomeDelete.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPopup(income.id);
            });

            incomeActions.appendChild(incomeEdit);
            incomeActions.appendChild(incomeDelete);
            incomesRecord.appendChild(incomeTitle);
            incomesRecord.appendChild(incomeActions);
            incomesRecords.appendChild(incomesRecord);
        }

        const createRecordElement: HTMLElement = document.createElement('div');
        createRecordElement.className = 'py-4 ps-4 border rounded income d-flex justify-content-center align-items-center';

        const createRecordLink: HTMLAnchorElement = document.createElement('a');
        createRecordLink.href = '/incomes/create';

        const createRecordIcon: HTMLElement = document.createElement('i');
        createRecordIcon.className = 'bi bi-plus-lg text-secondary';
        
        createRecordLink.appendChild(createRecordIcon);
        createRecordElement.appendChild(createRecordLink);
        incomesRecords.appendChild(createRecordElement);
    }
}