import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";
import { UrlUtils } from "../../utils/url-utils";

export class ExpensesEdit {
    private openNewRoute: Function;
    private expenseInput: HTMLInputElement | null = null;
    private expenseOriginalData: (CategoryResponseType | DefaultResponseType) | undefined;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.expenseInput = document.getElementById('expenseInput') as HTMLInputElement | null;

        const id: string | null = UrlUtils.getUrlParam('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        const cancelButton: HTMLElement | null = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.openNewRoute.bind(this, '/expenses'))
        }
        const updateButton: HTMLElement | null = document.getElementById('updateButton');
        if (updateButton) {
            updateButton.addEventListener('click', this.updateExpense.bind(this));
        }

        this.getExpense(id);
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

    private async getExpense(id: string): Promise<void> {
        const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/expense/' + id);

        if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
            alert('Возникла ошибка при запросе расхода. Обратитесь в поддержку.')
            if (result.redirect) {
                this.openNewRoute('/login');
            }
        }

        if (this.expenseOriginalData) {
            this.expenseOriginalData = result.response;
        }

        if (result.response) {
            this.showExpense(result.response);
        }
    }

    private showExpense(expense: CategoryResponseType | DefaultResponseType): void {
        if (this.expenseInput) {
            this.expenseInput.setAttribute('value', (expense as CategoryResponseType).title);
        }
    }

    private async updateExpense(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateFields()) {
            const changedData: any = {};
            if (this.expenseInput && this.expenseOriginalData) {
                if (this.expenseInput.value !== (this.expenseOriginalData as CategoryResponseType).title) {
                    changedData.title = this.expenseInput.value;
                }
            }

            if (Object.keys(changedData).length > 0) {
                if (this.expenseOriginalData) {
                    const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/expense/' + (this.expenseOriginalData as CategoryResponseType).id, 'PUT', true, changedData);

                    if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
                        alert('Возникла ошибка при обновлении расхода. Обратитесь в поддержку.')
                        if (result.redirect) {
                            this.openNewRoute('/login');
                        }
                    }
                }

            }
            return this.openNewRoute('/expenses');
        }
    }


}