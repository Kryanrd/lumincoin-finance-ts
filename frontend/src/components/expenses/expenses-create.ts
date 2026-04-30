import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";

export class ExpensesCreate {
    private openNewRoute: Function;
    private expenseInput: HTMLInputElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.expenseInput = document.getElementById('expenseInput') as HTMLInputElement | null;

        const cancelButton: HTMLElement | null = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.openNewRoute.bind(this, '/expenses'));
        }
        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
            createButton.addEventListener('click', this.saveExpenses.bind(this));
        }
    }

    private validateFields(): boolean {
        let isValid: boolean = true;
        if (this.expenseInput) {
            if (this.expenseInput.value) {
                this.expenseInput.classList.remove('is-invalid');
            } else {
                this.expenseInput.classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    private async saveExpenses(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateFields()) {
            if (this.expenseInput) {
                const createData:any = {
                    title: this.expenseInput.value
                }

                const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/expense', 'POST', true, createData);

                if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
                    alert('Возникла ошибка при создании расхода. Обратитесь в поддержку.')
                    if (result.redirect) {
                        this.openNewRoute('/login');
                    }
                }
            }

            this.openNewRoute('/expenses');
        }
    }

}