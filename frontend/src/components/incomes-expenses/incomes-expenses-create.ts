import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import type { OperationResponseType } from "../../types/operation-response.type";
import { HttpUtils } from "../../utils/http-utils";
import { UrlUtils } from "../../utils/url-utils";

export class IncomesExpensesCreate {
    private openNewRoute: Function;
    private typeSelectElement: HTMLSelectElement | null = null;
    private categorySelectElement: HTMLSelectElement | null = null;
    private amountInputElement: HTMLInputElement | null = null;
    private dateInputElement: HTMLInputElement | null = null;
    private commentInputElement: HTMLInputElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        const type: string | null = UrlUtils.getUrlParam('type');
        if (!type) {
            return this.openNewRoute('/');
        }

        this.findElements();

        const cancelButton: HTMLElement | null = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.openNewRoute.bind(this, '/incomes-expenses'));
        }
        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
            createButton.addEventListener('click', this.saveOperation.bind(this));
        }

        this.getCategories(type);
    }

    private findElements(): void {
        this.typeSelectElement = document.getElementById('typeSelect') as HTMLSelectElement;
        this.categorySelectElement = document.getElementById('categorySelect') as HTMLSelectElement;
        this.amountInputElement = document.getElementById('amountInput') as HTMLInputElement;
        this.dateInputElement = document.getElementById('dateInput') as HTMLInputElement;
        this.commentInputElement = document.getElementById('commentInput') as HTMLInputElement;
    }

    private async getCategories(type: string): Promise<void> {
        const result: HttpRequestResult<CategoryResponseType[] | DefaultResponseType> = await HttpUtils.request('/categories/' + type);
        if (result.redirect || result.error || !result.response || (result.response && (result.response as DefaultResponseType).error)) {
            alert('Возникла ошибка при запросе категории. Обратитесь в поддержку.')
            if (result.redirect) {
                this.openNewRoute('/login');
            }
        }

        const categories: CategoryResponseType[] = result.response as CategoryResponseType[];

        const typeOptions = [
            { value: 'income', text: 'Доход' },
            { value: 'expense', text: 'Расход' }
        ];

        typeOptions.forEach(opt => {
            const option: HTMLOptionElement = document.createElement('option');
            option.value = opt.value;
            option.innerText = opt.text;
            if (opt.value === type) {
                option.selected = true;
            }

            if (this.typeSelectElement) {
                this.typeSelectElement.appendChild(option);
                this.typeSelectElement.setAttribute('disabled', 'disabled');
            }
        });

        for (const category of categories) {
            const option = document.createElement('option');
            option.value = category.id.toString();
            option.innerText = category.title;
            this.categorySelectElement?.appendChild(option);
        }

    }

    private validateFields(): boolean {
        let isValid: boolean = true;
        if (this.amountInputElement) {
            if (this.amountInputElement.value && parseInt(this.amountInputElement.value) > 0) {
                this.amountInputElement.classList.remove('is-invalid');
            } else {
                this.amountInputElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.dateInputElement) {
            if (this.dateInputElement.value) {
                this.dateInputElement.classList.remove('is-invalid');
            } else {
                this.dateInputElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        if (this.commentInputElement) {
            if (this.commentInputElement.value) {
                this.commentInputElement.classList.remove('is-invalid');
            } else {
                this.commentInputElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    private async saveOperation(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateFields()) {
            if (this.typeSelectElement && this.amountInputElement && this.dateInputElement && this.commentInputElement && this.categorySelectElement) {
                const createData: any = {
                    type: this.typeSelectElement.value,
                    amount: parseInt(this.amountInputElement.value),
                    date: this.dateInputElement.value,
                    comment: this.commentInputElement.value,
                    category_id: Number(this.categorySelectElement.value)
                }

                const result: HttpRequestResult<OperationResponseType | DefaultResponseType> = await HttpUtils.request('/operations', 'POST', true, createData);

                if (result.redirect || result.error || !result.response || (result.response && (result.response as DefaultResponseType).error)) {
                    alert('Возникла ошибка при создании расхода. Обратитесь в поддержку.')
                    if (result.redirect) {
                        this.openNewRoute('/login');
                    }
                }

                this.openNewRoute('/incomes-expenses');
            }
        }
    }
}