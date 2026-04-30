import config from "../config/config";
import type { RefreshResponseType } from "../types/refresh-response.type";
import type { UserInfoType } from "../types/user-info.type";

export class AuthUtils {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoTokenKey: string = 'userInfo';

    public static setAuthInfo(accessToken: string, refreshToken: string, userInfo: UserInfoType | null = null): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    public static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    public static getAuthInfo(): { accessToken: string | null; refreshToken: string | null; userInfo: UserInfoType | null };
    public static getAuthInfo(key: string): string | null;
    public static getAuthInfo(key?: string): string | null | { accessToken: string | null; refreshToken: string | null; userInfo: UserInfoType | null } {
        if (key) {
            if ([this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
                return localStorage.getItem(key);
            }
            return null;
        } else {
            let userInfo: UserInfoType | null = null;
            const userInfoStr = localStorage.getItem(this.userInfoTokenKey);
            if (userInfoStr) {
                try {
                    userInfo = JSON.parse(userInfoStr) as UserInfoType;
                } catch (e) {
                    console.error('Failed to parse userInfo', e);
                }
            }
            return {
                accessToken: localStorage.getItem(this.accessTokenKey),
                refreshToken: localStorage.getItem(this.refreshTokenKey),
                userInfo: userInfo,
            };
        }
    }

    public static async updateRefreshToken(): Promise<boolean> {
        let result: boolean = false;
        const refreshToken: string | null = this.getAuthInfo(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.api + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ refreshToken: refreshToken })
            });
            if (response && response.status === 200) {
                const data: RefreshResponseType = await response.json();
                if (data && !data.error && data.tokens) {
                    this.setAuthInfo(data.tokens.accessToken, data.tokens.refreshToken);
                    result = true;
                }
            }
        }

        if (!result) {
            this.removeAuthInfo();
        }

        return result;
    }

}