import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";
import { UrlUtils } from "../../utils/url-utils";

export class IncomeEdit {
    private openNewRoute: Function;
    private incomeInput: HTMLInputElement | null = null;
    private incomeOriginalData: (CategoryResponseType | DefaultResponseType) | undefined;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.incomeInput = document.getElementById('incomeInput') as HTMLInputElement | null;

        const id: string | null = UrlUtils.getUrlParam('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        const cancelButton: HTMLElement | null = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.openNewRoute.bind(this, '/incomes'));
        }
        const updateButton: HTMLElement | null = document.getElementById('updateButton');
        if (updateButton) {
            updateButton.addEventListener('click', this.updateIncome.bind(this));
        }

        this.getIncome(id);

    }

    private validateFields(): boolean {
        let isValid: boolean = true;
        if (this.incomeInput) {
            if (this.incomeInput.value) {
                this.incomeInput.classList.remove('is-invalid');
            } else {
                this.incomeInput.classList.add('is-invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    private async getIncome(id: string): Promise<void> {
        const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/income/' + id);
        if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
            alert('Возникла ошибка при запросе расхода. Обратитесь в поддержку.')
            if (result.redirect) {
                this.openNewRoute('/login');
            }
        }

        if (this.incomeOriginalData) {
            this.incomeOriginalData = result.response;
        }

        if (result.response) {
            this.showIncome(result.response);
        }
    }

    private showIncome(income: CategoryResponseType | DefaultResponseType): void {
        if (this.incomeInput) {
            this.incomeInput.setAttribute('value', (income as CategoryResponseType).title);
        }
    }

    private async updateIncome(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateFields()) {
            const changedData: any = {};
            if (this.incomeInput && this.incomeOriginalData) {
                if (this.incomeInput.value !== (this.incomeOriginalData as CategoryResponseType).title) {
                    changedData.title = this.incomeInput.value;
                }
            }

            if (Object.keys(changedData).length > 0) {
                if (this.incomeOriginalData) {
                    const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/income/' + (this.incomeOriginalData as CategoryResponseType).id, 'PUT', true, changedData);

                    if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
                        alert('Возникла ошибка при обновлении расхода. Обратитесь в поддержку.')
                        if (result.redirect) {
                            this.openNewRoute('/login');
                        }
                    }
                }

            }

            return this.openNewRoute('/incomes');
        }
    }


}