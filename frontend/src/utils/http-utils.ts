import config from "../config/config";
import { AuthUtils } from "./auth-utils";

export class HttpUtils {
    public static async request(url: string, method: string = "GET", useAuth: boolean = true, body: any = null): Promise<any> {
        const result: any = {
            error: false,
            response: null
        };

        const params: any = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            }
        };

        let token: string | null = null;

        if (useAuth) {
            token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
            if (token) {
                params.headers['x-auth-token'] = token;
            }
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response: Response | null = null;

        try {
            response = await fetch(config.api + url, params);
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true;
            if (useAuth && response.status === 401) {
                if (!token) {
                    result.redirect = '/login';
                } else {
                    const updateTokenResult = await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        return this.request(url, method, useAuth, body);
                    } else {
                        result.redirect = '/login'
                    }

                }
            }
        }

        return result;

    }
}